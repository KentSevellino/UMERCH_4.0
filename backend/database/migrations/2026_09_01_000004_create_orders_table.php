<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('_orders', function (Blueprint $table) {
            $table->id('order_id');
            $table->foreignId('user_id')->nullable()->constrained('users', 'id')->onDelete('set null');
            $table->enum('status', ['Pending', 'Processing', 'Completed', 'Cancelled', 'Ready-for-pickup', 'Out-of-delivery'])->default('Pending');
            $table->string('receipt_form')->nullable();
            $table->dateTime('order_date');
            $table->string('payment_method')->nullable();
            $table->string('fulfillment_method')->nullable();
            $table->string('campus')->nullable();
            $table->timestamps();
        });

        Schema::create('_order_items', function (Blueprint $table) {
            $table->id('order_item_id');
            $table->foreignId('order_id')->constrained('_orders', 'order_id')->onDelete('cascade');
            $table->foreignId('product_id')->constrained('_products', 'product_id')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->string('variant')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('_order_items');
        Schema::dropIfExists('_orders');
    }
};
