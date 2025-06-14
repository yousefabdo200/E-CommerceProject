<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Traits\Response;
use App\Models\User;

class CartController extends Controller
{
    //
    use Response;

    public function addToCart(Request $request)
    {
        $validator = Validator::make(request()->all(), [
            'product_id' => 'required|exists:products,id',
            'amount' => 'required|integer|min:1'
        ]);
        if ($validator->fails()) {
            return $this->GeneralResponse($validator->errors(), "Failed to add to cart", false, 401);
        }
        $user_id = auth('api')->id();
        try {
            DB::statement(
                "INSERT INTO product_user (user_id, product_id, amount) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE amount = amount + ?",
                [$user_id, $request->product_id, $request->amount, $request->amount]
            );
        } catch (\Exception $e) {
            return $this->GeneralResponse($e->getMessage(), "Failed to add to cart", false, 401);
        }
        $user = User::find($user_id);
        $items = $user->products;
        return $this->GeneralResponse($items, "Successfully removed from cart", true, 204);
    }

    public function cartItems()
    {
        $user_id = auth('api')->id();
        $user = User::find($user_id);
        $items = $user->products;
        if ($items->isEmpty()) {
            return $this->GeneralResponse([], "No products in cart", false, 200);
        }
        return $this->GeneralResponse($items, "Cart items", true, 200);
    }

    public function decreaseCartItems($product_id)
    {
        $user_id = auth('api')->id();
        $cart_item = DB::table("product_user")->where("user_id", $user_id)->where("product_id", $product_id)->first();
        if ($cart_item) {
            $updated = DB::statement("UPDATE product_user SET amount = amount - ? WHERE user_id = ? AND product_id=?", [1, $user_id, $product_id]);
        }
        if ($updated) {
            DB::table('product_user')
                ->where('user_id', $user_id)
                ->where('product_id', $product_id)
                ->where('amount', '<=', 0)
                ->delete();
        }
        $user = User::find($user_id);
        $items = $user->products;
        return $this->GeneralResponse($items, "Successfully removed from cart", true, 204);
    }

    public function removeCartItem($product_id)
    {
        $user_id = auth('api')->id();
        $user = User::find($user_id);
        $user->products()->detach($product_id);
        $user = User::find($user_id);
        $items = $user->products;
        return $this->GeneralResponse($items, "Successfully removed from cart", true, 204);
    }

    public function removeCart()
    {
        $user_id = auth('api')->id();
        $user = User::find($user_id);
        $user->products()->detach();
        return $this->GeneralResponse([], "Successfully removed from cart", true, 204);
    }
}
