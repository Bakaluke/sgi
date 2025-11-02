<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_components', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->foreignId('component_id')->constrained('products')->onDelete('cascade');
            $table->decimal('quantity_used', 10, 4)->default(1.0000);            
            $table->timestamps();
            $table->unique(['tenant_id', 'product_id', 'component_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_components');
    }
};
