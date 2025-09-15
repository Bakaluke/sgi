<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);
        
        $query = Product::query()->with('category');

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('sku', 'like', "%{$searchTerm}%")
                  ->orWhereHas('category', function($subQ) use ($searchTerm) {
                      $subQ->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }
        
        $query->orderBy('id', 'desc');
        
        return $query->paginate($request->get('per_page', 30));
    }

    public function store(Request $request)
    {
        $this->authorize('create', Product::class);
        
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|unique:products,sku',
            'type' => ['required', Rule::in(['produto', 'servico'])],
            'description' => 'nullable|string',
            'sale_price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:10240',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_path'] = $path;
        }

        $product = Product::create($validatedData);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        $this->authorize('view', $product);
        return $product->load('category');
    }

    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:255|unique:products,sku,'.$product->id,
            'type' => ['required', Rule::in(['produto', 'servico'])],
            'description' => 'nullable|string',
            'sale_price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:10240',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $path = $request->file('image')->store('products', 'public');
            $validatedData['image_path'] = $path;
        }

        $product->update($validatedData);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->noContent();
    }
}