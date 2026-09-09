<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('_products', function (Blueprint $table) {
            $table->id('product_id');
            $table->string('product_name');
            $table->string('product_image')->nullable();
            $table->text('product_description')->nullable();
            $table->decimal('product_price', 8, 2);
            $table->integer('product_stock')->default(0);
            $table->string('variant');
            $table->string('variant_type')->nullable();
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('_products');
    }
};
