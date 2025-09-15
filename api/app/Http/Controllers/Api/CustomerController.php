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
            'document' => 'required|string|unique:customers,document',
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

        $customerData = Arr::except($validatedData, ['address']);
        $addressData = $validatedData['address'];

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
            'document' => ['required', 'string', Rule::unique('customers')->ignore($customer->id)],
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

    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        $customer->delete();
        
        return response()->noContent();
    }
}