<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['name','price','amount','img','description','category_id','admin_id'];
    public $timestamps = false;

    public function admin()
    {
        return $this ->belongsTo(Admin::class);
    }
    public function category(){
        return $this ->belongsTo(Category::class);
    }
    public function users()
    {
        return $this->belongsToMany(User::class)->withPivot('amount');    }
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'product_order','product_id','order_id' )->withPivot('amount');
    }
}

