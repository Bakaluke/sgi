<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('plan_id')->nullable()->constrained('plans');
            $table->string('name')->unique();
            $table->string('legal_name')->nullable();
            $table->string('company_fantasy_name')->nullable();
            $table->string('cnpj')->nullable()->unique();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('cep')->nullable(9);
            $table->string('street')->nullable();
            $table->string('number')->nullable();
            $table->string('complement')->nullable();
            $table->string('neighborhood')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable(2);
            $table->string('logo_path')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
