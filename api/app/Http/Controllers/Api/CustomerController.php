<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Arr;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Customer::class);
        
        $query = Customer::with('addresses');

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                ->orWhere('document', 'like', "%{$searchTerm}%")
                ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }
        
        $query->orderBy('id', 'desc');

        $customers = $query->paginate(30);

        return $customers;
    }

    public function store(Request $request)
    {
        $this->authorize('create', Customer::class);

        $validatedData = $request->validate([
            'type' => ['required', Rule::in(['fisica', 'juridica'])],
            'document' => 'nullable|string|unique:customers,document',
            'name' => 'required|string|max:255',
            'legal_name' => 'required_if:type,juridica|nullable|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'required|string|max:20',
            'address.cep' => 'required|string',
            'address.street' => 'required|string|max:255',
            'address.number' => 'required|string|max:20',
            'address.complement' => 'nullable|string|max:255',
            'address.neighborhood' => 'required|string|max:255',
            'address.city' => 'required|string|max:255',
            'address.state' => 'required|string|max:2',
        ]);

        $tenantId = $request->user()->tenant_id;

        $customerData = Arr::except($validatedData, ['address']);

        $customerData['tenant_id'] = $tenantId;

        $addressData = $validatedData['address'];

        $addressData['tenant_id'] = $tenantId;

        $customer = DB::transaction(function () use ($customerData, $addressData) {
            $customer = Customer::create($customerData);
            $customer->addresses()->create($addressData);
            return $customer;
        });

        return response()->json($customer->load('addresses'), 201);
    }

    public function show(Customer $customer)
    {
        $this->authorize('view', $customer);

        return $customer->load('addresses');
    }

    public function update(Request $request, Customer $customer)
    {
        $this->authorize('update', $customer);

        $validatedData = $request->validate([
            'type' => ['required', Rule::in(['fisica', 'juridica'])],
            'document' => ['nullable', 'string', Rule::unique('customers')->ignore($customer->id)],
            'name' => 'required|string|max:255',
            'legal_name' => 'required_if:type,juridica|nullable|string|max:255',
            'email' => ['required', 'email', Rule::unique('customers')->ignore($customer->id)],
            'phone' => 'required|string|max:20',
            'address.cep' => 'required|string',
            'address.street' => 'required|string|max:255',
            'address.number' => 'required|string|max:20',
            'address.complement' => 'nullable|string|max:255',
            'address.neighborhood' => 'required|string|max:255',
            'address.city' => 'required|string|max:255',
            'address.state' => 'required|string|max:2',
        ]);
        
        $customerData = Arr::except($validatedData, ['address']);

        $addressData = $validatedData['address'];

        DB::transaction(function () use ($customerData, $addressData, $customer) {
            $customer->update($customerData);
            if ($customer->addresses()->exists()) {
                $customer->addresses()->first()->update($addressData);
            } else {
                $customer->addresses()->create($addressData);
            }
        });

        return response()->json($customer->load('addresses'));
    }

    public function updateDocument(Request $request, Customer $customer)
    {
        $this->authorize('update', $customer);

        $validated = $request->validate([
            'document' => ['required', 'string', 'max:14', Rule::unique('customers')->ignore($customer->id)],
        ]);

        $customer->update($validated);
        
        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        $customer->delete();
        
        return response()->noContent();
    }

    public function export()
    {
        $this->authorize('viewAny', Customer::class);

        $fileName = 'clientes.csv';

        $customers = Customer::with('addresses')->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function() use($customers) {
            $file = fopen('php://output', 'w');
            
            fputs($file, $bom =( chr(0xEF) . chr(0xBB) . chr(0xBF) ));

            $columns = ['ID', 'Nome', 'Tipo', 'Documento', 'E-mail', 'Telefone', 'Endereço'];
            
            fputcsv($file, $columns, ';');

            foreach ($customers as $customer) {
                $primaryAddress = $customer->addresses->first();
                $addressString = $primaryAddress ? implode(', ', array_filter([
                    $primaryAddress->street,
                    $primaryAddress->number ? 'nº ' . $primaryAddress->number : null,
                    $primaryAddress->neighborhood,
                    $primaryAddress->city ? $primaryAddress->city . ' - ' . $primaryAddress->state : null,
                    $primaryAddress->cep
                ])) : 'N/A';

                $row['ID'] = $customer->id;
                $row['Nome'] = $customer->name;
                $row['Tipo'] = $customer->type === 'fisica' ? 'Pessoa Física' : 'Pessoa Jurídica';
                $row['Documento'] = $customer->document;
                $row['E-mail'] = $customer->email;
                $row['Telefone'] = $customer->phone;
                $row['Endereço'] = $addressString;

                fputcsv($file, array_values($row), ';');
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}