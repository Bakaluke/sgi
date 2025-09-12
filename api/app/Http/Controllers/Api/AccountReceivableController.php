<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccountReceivable;
use Illuminate\Http\Request;

class AccountReceivableController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', AccountReceivable::class);

        $receivables = AccountReceivable::with(['customer', 'quote'])
            ->latest()
            ->paginate(30);

        return $receivables;
    }
}