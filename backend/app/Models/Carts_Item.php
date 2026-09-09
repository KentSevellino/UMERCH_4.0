<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Carts_Item extends Model
{
    protected $table = '_cart_items';
    protected $primaryKey = 'cart_item_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'variant',
        'price',
    ];

    public function product()
    {
        return $this->belongsTo(Products::class, 'product_id', 'product_id');
    }

    public function cart()
    {
        return $this->belongsTo(Carts::class, 'cart_id', 'cart_id');
    }
}
