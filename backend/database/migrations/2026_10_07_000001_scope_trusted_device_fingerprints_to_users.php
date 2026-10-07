<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trusted_devices', function (Blueprint $table) {
            $table->unique(['user_id', 'device_fingerprint']);
            $table->index('device_fingerprint');
            $table->dropUnique('trusted_devices_device_fingerprint_unique');
        });
    }

    public function down(): void
    {
        // Restoring global uniqueness must never discard another account's device.
        if (DB::table('trusted_devices')->select('device_fingerprint')
            ->groupBy('device_fingerprint')->havingRaw('COUNT(*) > 1')->exists()) {
            throw new RuntimeException('Cannot restore global device uniqueness while accounts share a fingerprint.');
        }

        Schema::table('trusted_devices', function (Blueprint $table) {
            $table->unique('device_fingerprint');
            $table->dropUnique('trusted_devices_user_id_device_fingerprint_unique');
            $table->dropIndex('trusted_devices_device_fingerprint_index');
        });
    }
};
