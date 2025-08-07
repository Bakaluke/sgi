<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->renameColumn('company_name', 'legal_name');
            $table->string('company_fantasy_name')->nullable()->after('legal_name');
            $table->string('cep', 9)->nullable()->after('phone');
            $table->string('street')->nullable()->after('cep');
            $table->string('number', 20)->nullable()->after('street');
            $table->string('complement')->nullable()->after('number');
            $table->string('neighborhood')->nullable()->after('complement');
            $table->string('city')->nullable()->after('neighborhood');
            $table->string('state', 2)->nullable()->after('city');
            $table->dropColumn('address');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->renameColumn('legal_name', 'company_name');
            $table->dropColumn(['company_fantasy_name', 'cep', 'street', 'number', 'complement', 'neighborhood', 'city', 'state']);
            $table->text('address')->nullable();
        });
    }
};
