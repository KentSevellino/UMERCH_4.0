<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockIn extends Model
{
    protected $table = 'stock_ins';
    protected $primaryKey = 'stock_in_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'product_id',
        'variant',
        'stock_qty',
        'cost',
        'stock_in_date',
    ];
}
