<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryLog extends Model
{
    protected $fillable = [
        'product_id',
        'item_name',
        'type',
        'quantity',
        'total',
        'admin_action',
    ];

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id', 'product_id')->withDefault([
            'product_name' => 'Deleted Product',
        ]);
    }
}
