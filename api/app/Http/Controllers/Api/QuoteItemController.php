<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            $item->increment('quantity', $validated['quantity']);
        } else {
            $lucro = $product->sale_price - $product->cost_price;
            $lucro2 = $lucro / $product->sale_price;
            $profit = $lucro2 * 100;

            $item = $quote->items()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'quantity' => $validated['quantity'],
                'unit_cost_price' => $product->cost_price,
                'unit_sale_price' => $product->sale_price,
                'discount_percentage' => 0,
                'profit_margin' => $profit,
                'total_price' => $validated['quantity'] * $product->sale_price,
            ]);
        }
        
        $item->updateTotalPrice();
        
        $quote->recalculateTotals();
        
        return $quote->load(['items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);
    }

    public function update(Request $request, Quote $quote, QuoteItem $quote_item)
    {
        $this->authorize('update', [$quote_item, $quote]);

        $validatedData = $request->validate([
            'quantity' => 'sometimes|required|integer|min:1',
            'unit_sale_price' => 'sometimes|required|numeric|min:0',
            'discount_percentage' => 'sometimes|required|numeric|min:0|max:100',
            'profit_margin' => 'sometimes|required|numeric|min:0|max:99.99',
            'notes' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,png,jiff,tiff,zip,psd,cdr,ai,eps|max:524288',
        ]);

        $costPrice = $quote_item->unit_cost_price;

        if ($request->has('profit_margin') && !$request->has('unit_sale_price')) {
            $margin = $validatedData['profit_margin'] / 100;
            if ($margin < 1 && $costPrice > 0) {
                $validatedData['unit_sale_price'] = $costPrice / (1 - $margin);
            }
        } elseif ($request->has('unit_sale_price')) {
            $salePrice = $validatedData['unit_sale_price'];
            if ($salePrice > 0 && $costPrice > 0) {
                $validatedData['profit_margin'] = (($salePrice - $costPrice) / $salePrice) * 100;
            } else {
                $validatedData['profit_margin'] = 0;
            }
        }

        if ($request->hasFile('file')) {
            if ($quote_item->file_path) {
                Storage::disk('public')->delete($quote_item->file_path);
            }
            $path = $request->file('file')->store('quote_items_files', 'public');
            $validatedData['file_path'] = $path;
        }

        $quote_item->update($validatedData);

        $discount = $quote_item->unit_sale_price * ($quote_item->discount_percentage / 100);
        $priceWithDiscount = $quote_item->unit_sale_price - $discount;
        $quote_item->total_price = $quote_item->quantity * $priceWithDiscount;
        $quote_item->save();

        $quote->recalculateTotals();

        return $quote->load(['items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);
    }

    public function destroy(Quote $quote, QuoteItem $quote_item)
    {
        $this->authorize('delete', [$quote_item, $quote]);
        
        if ($quote_item->file_path) {
            Storage::disk('public')->delete($quote_item->file_path);
        }

        $quote_item->delete();

        $quote->recalculateTotals();
        
        return $quote->load(['items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);
    }

    public function destroyFile(QuoteItem $quote_item)
    {
        $this->authorize('update', [$quote_item, $quote_item->quote]);

        if ($quote_item->file_path) {
            Storage::disk('public')->delete($quote_item->file_path);
            $quote_item->file_path = null;
            $quote_item->save();
        }
        
        return $quote_item->quote->load(['items.product', 'status', 'paymentMethod', 'deliveryMethod', 'negotiationSource']);
    }
}