<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('_inventory', function (Blueprint $table) {
            $table->id('inventory_id');
            $table->foreignId('product_id')->constrained('_products', 'product_id')->onDelete('cascade');
            $table->string('variant');
            $table->integer('quantity')->default(0);
            $table->string('status')->default('active');
            $table->decimal('cost', 10, 2)->nullable();
            $table->unique(['product_id', 'variant']);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('_inventory');
    }
};
