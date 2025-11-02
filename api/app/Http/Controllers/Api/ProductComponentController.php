<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductComponent;
use Illuminate\Http\Request;

class ProductComponentController extends Controller
{
    public function index(Product $product)
    {
        $this->authorize('view', $product);
        return $product->components()->with('component')->get();
    }

    public function store(Request $request, Product $product)
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'component_id' => 'required|exists:products,id',
            'quantity_used' => 'required|numeric|min:0.0001',
        ]);

        $component = ProductComponent::create([
            'tenant_id' => $request->user()->tenant_id,
            'product_id' => $product->id,
            'component_id' => $validated['component_id'],
            'quantity_used' => $validated['quantity_used'],
        ]);

        return $component->load('component');
    }

    public function destroy(ProductComponent $component)
    {
        $this->authorize('delete', $component->product);
        $component->delete();
        return response()->noContent();
    }
}