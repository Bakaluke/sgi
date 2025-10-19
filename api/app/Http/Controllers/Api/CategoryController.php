<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Category::class);

        return Category::withCount('products')->latest()->get();
    }

    public function store(Request $request)
    {
        $this->authorize('create', Category::class);

        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:categories',
        ]);

        $validatedData['tenant_id'] = $request->user()->tenant_id;

        $category = Category::create($validatedData);

        return response()->json($category, 201);
    }

    public function show(Category $category)
    {
        $this->authorize('view', $category);
        
        return $category;
    }

    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
        ]);

        $category->update($validatedData);

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        $category->delete();

        return response()->noContent();
    }
}