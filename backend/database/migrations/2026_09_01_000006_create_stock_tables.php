<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('stock_ins', function (Blueprint $table) {
            $table->id('stock_in_id');
            $table->foreignId('product_id')->constrained('_products', 'product_id')->onDelete('cascade');
            $table->string('variant')->nullable();
            $table->integer('stock_qty');
            $table->decimal('cost', 10, 2);
            $table->timestamp('stock_in_date');
            $table->unique(['product_id', 'variant'], 'stock_ins_product_variant_unique');
            $table->timestamps();
        });

        Schema::create('stock_outs', function (Blueprint $table) {
            $table->id('stock_out_id');
            $table->foreignId('product_id')->constrained('_products', 'product_id')->onDelete('cascade');
            $table->unsignedBigInteger('order_id')->nullable();
            $table->foreign('order_id')->references('order_id')->on('_orders')->onDelete('cascade');
            $table->integer('quantity');
            $table->string('modified_by');
            $table->string('reason')->default('order');
            $table->timestamp('date_time');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('stock_outs');
        Schema::dropIfExists('stock_ins');
    }
};
