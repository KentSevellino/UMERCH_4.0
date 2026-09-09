<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id('activity_logs_id');
            $table->string('action', 255);
            $table->string('description');
            $table->dateTime('created_at')->useCurrent();
        });

        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained('_products', 'product_id')->onDelete('set null');
            $table->string('item_name');
            $table->enum('type', ['Stock In', 'Stock Out', 'Add Product', 'Delete Product', 'Archived', 'Restored', 'Edit Product']);
            $table->integer('quantity')->default(0);
            $table->integer('total')->default(0);
            $table->string('admin_action')->default('Admin_1');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('inventory_logs');
        Schema::dropIfExists('activity_logs');
    }
};
