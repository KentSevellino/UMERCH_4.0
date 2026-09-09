<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Orders extends Model
{
    protected $table = '_orders';
    protected $primaryKey = 'order_id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'status',
        'receipt_form',
        'order_date',
        'payment_method',
        'fulfillment_method',
        'campus',
    ];

    public function orderItems()
    {
        return $this->hasMany(OrderItems::class, 'order_id', 'order_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id')->withDefault([
            'user_fullname' => 'Unknown',
            'email' => 'N/A',
            'um_id' => 'N/A',
        ]);
    }
}
