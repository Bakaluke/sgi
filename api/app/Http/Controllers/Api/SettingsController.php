<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingsController extends Controller
{
    public function show()
    {
        $settings = Setting::firstOrFail();
        $this->authorize('view', $settings);
        return $settings;
    }

    public function update(Request $request)
    {
        $settings = Setting::firstOrFail();
        $this->authorize('update', $settings);

        $validated = $request->validate([
            'legal_name' => 'nullable|string|max:255',
            'company_fantasy_name' => 'nullable|string|max:255',
            'cnpj' => 'nullable|string|max:18',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'cep' => 'nullable|string|max:9',
            'street' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
            'complement' => 'nullable|string|max:255',
            'neighborhood' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:2',
            'logo' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('logo')) {
            if ($settings->logo_path) {
                Storage::disk('public')->delete($settings->logo_path);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo_path'] = $path;
        }

        $settings->update($validated);

        return $settings;
    }
}