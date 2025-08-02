<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Quote;
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
            return Quote::with(['customer', 'user'])->orderBy('id', 'desc')->get();
        }

        if ($user->role === 'vendedor') {
            return Quote::where('user_id', $user->id)->with(['customer', 'user'])->orderBy('id', 'desc')->get();
        }

        return response()->json([]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Quote::class);

        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'payment_method' => 'nullable|string|max:255',
            'delivery_method' => 'nullable|string|max:255',
            'delivery_datetime' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $customer = Customer::with('addresses')->findOrFail($validated['customer_id']);
        
        $user = $request->user();

        $primaryAddress = $customer->addresses->first();
        $addressString = $primaryAddress ? implode(', ', array_filter([
            $primaryAddress->street, 'nº ' . $primaryAddress->number, $primaryAddress->neighborhood,
            $primaryAddress->city . ' - ' . $primaryAddress->state,
            $primaryAddress->cep
        ])) : null;

        $customerSnapshot = [
            'name' => $customer->name, 'email' => $customer->email,
            'phone' => $customer->phone, 'address' => $addressString,
        ];

        $quote = Quote::create([
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'salesperson_name' => $user->name,
            'customer_data' => $customerSnapshot,
            'payment_method' => $validated['payment_method'] ?? null,
            'delivery_method' => $validated['delivery_method'] ?? null,
            'delivery_datetime' => $validated['delivery_datetime'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return $quote->load(['customer.addresses', 'user', 'items']);
    }

    public function show(Quote $quote)
    {
        $this->authorize('view', $quote);

        return $quote->load(['customer.addresses', 'user', 'items.product']);
    }

    public function update(Request $request, Quote $quote)
    {
        $this->authorize('update', $quote);

        $validated = $request->validate([
            'delivery_method' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'status' => 'nullable|string',
            'delivery_datetime' => 'nullable|date',
        ]);

        $subtotal = $quote->items()->sum('total_price');
        $discountValue = $subtotal * (($validated['discount_percentage'] ?? $quote->discount_percentage) / 100);
        $totalAmount = $subtotal - $discountValue;

        $validated['subtotal'] = $subtotal;
        $validated['total_amount'] = $totalAmount;

        $quote->update($validated);

        return $quote->load(['customer.addresses', 'user', 'items.product']);
    }

    public function destroy(Quote $quote)
    {
        $this->authorize('delete', $quote);
        
        $quote->delete();
        
        return response()->noContent();
    }

    public function generatePdf(Quote $quote)
    {
        $quote->load(['customer.addresses', 'user', 'items.product']);

        $pdf = Pdf::loadView('pdf.quote', [
            'quote' => $quote,
            'customer_data' => $quote->customer_data
        ]);

        return $pdf->stream('orcamento-'.$quote->id.'.pdf');
    }
}
