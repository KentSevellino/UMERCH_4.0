<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Products extends Model
{
    protected $table = '_products';
    protected $primaryKey = 'product_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'product_name',
        'product_image',
        'product_description',
        'product_price',
        'product_stock',
        'variant',
        'variant_type',
        'status',
    ];

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'product_id', 'product_id');
    }

    public function getTotalStockAttribute()
    {
        return $this->inventory()->sum('quantity') ?? 0;
    }
}
