<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionOrder;
use Illuminate\Http\Request;

class ProductionOrderController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ProductionOrder::class);
        $user = $request->user();

        $query = ProductionOrder::with(['customer', 'quote', 'user']);

        if ($user->role === 'vendedor') {
            $query->where('user_id', $user->id);
        }

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

        $orders = $query->latest()->paginate(15);

        return $orders;
    }

    public function store(Request $request)
    {
        //
    }

    public function show(ProductionOrder $productionOrder)
    {
        //
    }

    public function update(Request $request, ProductionOrder $productionOrder)
    {
        //
    }

    public function destroy(ProductionOrder $productionOrder)
    {
        //
    }
}
