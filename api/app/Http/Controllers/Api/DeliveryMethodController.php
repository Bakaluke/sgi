<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryMethod;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DeliveryMethodController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', DeliveryMethod::class);
        return DeliveryMethod::orderBy('name', 'asc')->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', DeliveryMethod::class);
        $validated = $request->validate(['name' => 'required|string|unique:delivery_methods,name']);
        $deliveryMethod = DeliveryMethod::create($validated);
        return response()->json($deliveryMethod, 201);
    }

    public function update(Request $request, DeliveryMethod $deliveryMethod)
    {
        $this->authorize('update', $deliveryMethod);
        $validated = $request->validate(['name' => ['required','string', Rule::unique('delivery_methods')->ignore($deliveryMethod->id)]]);
        $deliveryMethod->update($validated);
        return response()->json($deliveryMethod);
    }

    public function destroy(DeliveryMethod $deliveryMethod)
    {
        $this->authorize('delete', $deliveryMethod);
        $deliveryMethod->delete();
        return response()->noContent();
    }
}