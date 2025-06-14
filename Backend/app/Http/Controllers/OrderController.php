<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Traits\Response;
use App\Models\User;
class OrderController extends Controller
{
    //
    use Response;
    public function createOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'address'=>'required',
            'products'=>'required',
        ]);
        if($validator->fails()){
            return $this->GeneralResponse($validator->errors(),"Validation errors",false,401);
        }
        $user=User::find( auth('api')->id());
        $adminIds=collect($request->products)->groupBy('admin_id');
        $orders=[];
        foreach($adminIds as $adminId=>$products){
            $order=Order::create([
                'user_id'=>$user->id,
                'admin_id'=>$adminId,
                'location'=>$request->address
            ]);
            $orderItems=[];
            foreach($products as $product){
                $product_id = is_array($product) ? $product['id'] : $product->id;
                $amount = is_array($product) ? $product['amount'] : $product->amount;
                $orderItems[$product_id]=['amount' => $amount];

            }
            $order->products()->attach($orderItems);
            $orders[] = $order;
        }
        DB::table('product_user')->where('user_id',$user->id)->delete();
        return $this->GeneralResponse([],"Order created successfully",true,201);
    }
    public function allUserOrders()
    {
        $orders = Order::where('user_id', auth('api')->id())
            ->with(['products' => function($query) {
                $query->select('products.id', 'name', 'price'); // only product fields
            }])
            ->paginate(50);

        return $this->GeneralResponse($orders, "User orders", true, 200);
    }

    public function allOrders()
    {
        $orders = Order::with(['products' => function($query) {
            $query->select('products.id', 'name', 'price'); // only product fields
        }])->paginate(50);

        return $this->GeneralResponse($orders, "All orders", true, 200);
    }
    public function getOrder($id)
    {
            $order = Order::with('products')->find($id);

        if (!$order) {
            return $this->GeneralResponse(null, "Order not found", false, 404);
        }

        return $this->GeneralResponse($order, "Order fetched successfully", true, 200);
    }
    public function acceptOrder($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return $this->GeneralResponse(null, "Order not found", false, 404);
        }

        $order->status = 'Accepted'; // assuming you have a `status` column
        $order->save();

        return $this->GeneralResponse($order, "Order Accepted", true, 200);
    }
    public function rejectOrder($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return $this->GeneralResponse(null, "Order not found", false, 404);
        }

        $order->status = 'rejected'; // assuming you have a `status` column
        $order->save();

        return $this->GeneralResponse($order, "Order rejected", true, 200);
    }

}
