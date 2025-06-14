<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Product;
class Order extends Model
{
    //id,
    protected $fillable=['location','status','user_id','admin_id', 'created_at', 'updated_at'];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_order' ,'order_id','product_id' )->withPivot('amount');
    }
}
