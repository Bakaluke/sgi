<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Http\Request;

class QuoteItemController extends Controller
{
    public function store(Request $request, Quote $quote)
    {
        $this->authorize('create', [QuoteItem::class, $quote]);

        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::find($validated['product_id']);
        
        $item = $quote->items()->where('product_id', $product->id)->first();

        if ($item) {
            $item->quantity += $validated['quantity'];
            
            $discount = $item->unit_sale_price * ($item->discount_percentage / 100);
            $priceWithDiscount = $item->unit_sale_price - $discount;
            $item->total_price = $item->quantity * $priceWithDiscount;
            
            $item->save();
        } else {
            $quote->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $validated['quantity'],
                'unit_cost_price' => $product->cost_price,
                'unit_sale_price' => $product->sale_price,
                'total_price' => $validated['quantity'] * $product->sale_price,
            ]);
        }
        
        $subtotal = $quote->items()->sum('total_price');
        $discountValue = $subtotal * ($quote->discount_percentage / 100);
        $totalAmount = $subtotal - $discountValue;

        $quote->update([
            'subtotal' => $subtotal,
            'total_amount' => $totalAmount,
        ]);
        
        $quote->refresh();
        
        return $quote->load(['customer.addresses', 'user', 'items.product']);
    }

    public function update(Request $request, Quote $quote, QuoteItem $quote_item)
    {
        if ($quote_item->quote_id !== $quote->id) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $validated = $request->validate([
            'quantity' => 'sometimes|required|integer|min:1',
            'unit_sale_price' => 'sometimes|required|numeric|min:0',
            'discount_percentage' => 'sometimes|required|numeric|min:0|max:100',
            'profit_margin' => 'sometimes|numeric|min:0|max:100',
        ]);

        if ($request->has('profit_margin')) {
            $margin = $validated['profit_margin'] / 100;
            if ($margin < 1) {
                $newSalePrice = $quote_item->unit_cost_price / (1 - $margin);
                $quote_item->unit_sale_price = $newSalePrice;
            }
        }

        $quote_item->update($validated);

        $discount = $quote_item->unit_sale_price * ($quote_item->discount_percentage / 100);
        $priceWithDiscount = $quote_item->unit_sale_price - $discount;
        $quote_item->total_price = $quote_item->quantity * $priceWithDiscount;
        $quote_item->save();

        $subtotal = $quote->items()->sum('total_price');
        $discountValue = $subtotal * ($quote->discount_percentage / 100);
        $totalAmount = $subtotal - $discountValue;

        $quote->update([
            'subtotal' => $subtotal,
            'total_amount' => $totalAmount,
        ]);

        $quote->refresh();

        return $quote->load('items.product');
    }

    public function destroy(Quote $quote, QuoteItem $quote_item)
    {
        if ($quote_item->quote_id !== $quote->id) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $quote_item->delete();

        $subtotal = $quote->items()->sum('total_price');
        $discountValue = $subtotal * ($quote->discount_percentage / 100);
        $totalAmount = $subtotal - $discountValue;

        $quote->update([
            'subtotal' => $subtotal,
            'total_amount' => $totalAmount,
        ]);

        $quote->refresh();

        return $quote->load('items.product');
    }
}