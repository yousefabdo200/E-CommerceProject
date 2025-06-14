<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class ProductUser extends Pivot
{
    //
    protected $hidden = ['user_id', 'product_id'];
}
