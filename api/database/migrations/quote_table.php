<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('quotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('restrict');
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('status_id')->nullable()->constrained('quote_statuses')->onDelete('restrict');

            $table->json('customer_data');
            $table->string('salesperson_name');

            $table->dateTime('delivery_datetime')->nullable();
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->onDelete('restrict');
            $table->foreignId('payment_term_id')->nullable()->constrained('payment_terms')->onDelete('restrict');
            $table->foreignId('delivery_method_id')->nullable()->constrained('delivery_methods')->onDelete('restrict');
            $table->foreignId('negotiation_source_id')->nullable()->constrained('negotiation_sources')->onDelete('restrict');

            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('quotes');
    }
};
