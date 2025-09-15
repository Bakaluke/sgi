<?php

namespace App\Http\Controllers\Api;

use App\Events\QuoteApproved;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Quote;
use App\Models\QuoteStatus;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Arr;
use Barryvdh\DomPDF\Facade\Pdf;

class QuoteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->role === 'admin') {
            $query = Quote::query();
        } elseif ($user->role === 'vendedor') {
            $query = Quote::where('user_id', $user->id);
        } else {
            return response()->json(['data' => []]);
        }

        $query->with(['customer', 'user', 'items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('id', 'like', "%{$searchTerm}%")
                ->orWhere('status', 'like', "%{$searchTerm}%")
                ->orWhereHas('customer', function ($subQ) use ($searchTerm) {
                    $subQ->where('name', 'like', "%{$searchTerm}%");
                });
            });
        }
        
        $query->orderBy('id', 'desc');
        
        return $query->paginate(30);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Quote::class);

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'delivery_method_id' => 'nullable|exists:delivery_methods,id',
            'negotiation_source_id' => 'nullable|exists:negotiation_sources,id',
            'delivery_datetime' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $defaultStatus = QuoteStatus::where('name', 'Aberto')->first();
        if (!$defaultStatus) {
            abort(500, 'Status padrão "Aberto" não encontrado.');
        }

        $customer = Customer::with('addresses')->findOrFail($validated['customer_id']);
        
        $user = $request->user();

        $primaryAddress = $customer->addresses->first();
        $addressString = $primaryAddress ? implode(', ', array_filter([
            $primaryAddress->street, 'nº ' . $primaryAddress->number, $primaryAddress->neighborhood,
            $primaryAddress->city . ' - ' . $primaryAddress->state,
            $primaryAddress->cep
        ])) : null;

        $customerSnapshot = [
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $addressString,
        ];

        $quote = Quote::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'status_id' => $defaultStatus->id,
            'customer_data' => $customerSnapshot,
            'salesperson_name' => $user->name,
            'notes' => $validated['notes'] ?? null,
            'delivery_datetime' => $validated['delivery_datetime'] ?? null,
            'delivery_method_id' => $validated['delivery_method_id'],
            'payment_method_id' => $validated['payment_method_id'],
            'negotiation_source_id' => $validated['negotiation_source_id'] ?? null,
        ]);
        
        return $quote->load(['customer.addresses', 'user', 'items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);
    }

    public function show(Quote $quote)
    {
        $this->authorize('view', $quote);

        return $quote->load(['customer.addresses', 'user', 'items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);
    }

    public function update(Request $request, Quote $quote)
    {
        $this->authorize('update', $quote);

        $oldStatusName = $quote->status?->name;

        $validated = $request->validate([
            'payment_method_id' => 'required|exists:payment_methods,id',
            'delivery_method_id' => 'required|exists:delivery_methods,id',
            'status_id' => 'required|exists:quote_statuses,id',
            'negotiation_source_id' => 'required|exists:negotiation_sources,id',
            'delivery_datetime' => 'required|date',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ]);
        
        $quote->update($validated);
        
        $quote->refresh();
        $newStatusName = $quote->status?->name;

        if ($oldStatusName !== 'Aprovado' && $newStatusName === 'Aprovado') {
            QuoteApproved::dispatch($quote);
        }

        $subtotal = $quote->items()->sum(DB::raw('unit_sale_price * quantity * (1 - discount_percentage / 100)'));
        $discountValue = $subtotal * ($quote->discount_percentage / 100);
        $totalAmount = $subtotal - $discountValue;

        $quote->subtotal = $subtotal;
        $quote->total_amount = $totalAmount;
        $quote->save();

        return $quote->load(['customer.addresses', 'user', 'items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);
    }

    public function destroy(Quote $quote)
    {
        $this->authorize('delete', $quote);
        
        $quote->delete();
        
        return response()->noContent();
    }

    public function generatePdf(Quote $quote)
    {
        $quote->load(['customer.addresses', 'user', 'items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);

        $settings = Setting::first();

        $pdf = Pdf::loadView('pdf.quote', [
            'quote' => $quote,
            'customer_data' => $quote->customer_data,
            'settings' => $settings
        ]);

        return $pdf->stream('orcamento-'.$quote->id.'.pdf');
    }

    public function export(Request $request)
    {
        $this->authorize('viewAny', Quote::class);

        $user = $request->user();
        $fileName = 'orcamentos.csv';

        $query = Quote::query();
        if (!$user->can('quotes.view_all')) {
            $query->where('user_id', $user->id);
        }
        $quotes = $query->with(['customer', 'user', 'status'])->get();

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($quotes) {
            $file = fopen('php://output', 'w');
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

            $columns = ['Nº', 'Cliente', 'Vendedor', 'Status', 'Data', 'Valor Total'];
            fputcsv($file, $columns, ';');

            foreach ($quotes as $quote) {
                $row = [
                    $quote->id,
                    $quote->customer->name,
                    $quote->user->name,
                    $quote->status?->name ?? 'N/A',
                    (new \DateTime($quote->created_at))->format('d/m/Y'),
                    number_format($quote->total_amount, 2, ',', '.'),
                ];
                fputcsv($file, $row, ';');
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
