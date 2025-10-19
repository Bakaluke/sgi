<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class SettingsController extends Controller
{
    public function show(Request $request)
    {
        $this->authorize('settings.manage');

        return response()->json($request->user()->tenant);
    }

    public function update(Request $request)
    {
        $this->authorize('settings.manage');
        
        $tenant = $request->user()->tenant;

        $validatedData = $request->validate([
            'legal_name' => 'nullable|string|max:255',
            'company_fantasy_name' => 'nullable|string|max:255',
            'cnpj' => ['required', 'string', 'max:18', Rule::unique('tenants')->ignore($tenant->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('tenants')->ignore($tenant->id)],
            'phone' => 'nullable|string|max:20',
            'cep' => 'nullable|string|max:9',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:2',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg|max:10240',
            'website' => 'nullable|url|max:255',
        ]);

        if ($request->hasFile('logo')) {
            if ($tenant->logo_path) {
                Storage::disk('public')->delete($tenant->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $validatedData['logo_path'] = $path;
        }

        $tenant->update($validatedData);

        return response()->json($tenant);
    }
}
