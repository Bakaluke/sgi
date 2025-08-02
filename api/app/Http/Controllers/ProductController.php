<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index()
    {
        return Product::orderBy('id', 'desc')->get();
    }

    public function create()
    {
        
    }

    public function store(Request $request)
    {
        $this->authorize('create', Product::class);
        
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'quantity_in_stock' => 'required|integer|min:0',
        ]);

        $product = Product::create($validatedData);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        
    }

    public function edit(Product $product)
    {
        
    }

    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => ['required', 'string', Rule::unique('products')->ignore($product->id)],
            'description' => 'nullable|string',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'quantity_in_stock' => 'required|integer|min:0',
        ]);

        $product->update($validatedData);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        
        $product->delete();

        return response()->noContent();
    }
}
