<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Traits\Response;
class ProductController extends Controller
{
    //
    use Response;

    public function createProduct(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'name'=>'required|string|max:250',
            'description'=>'required|string|min:5|max:1500',
            'price'=>'required|numeric|min:0|max:100000',
            'amount'=>'required|numeric|min:1|max:100000',
            'img'=>'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category_name'=>'required|string|max:250',
        ]);
        if($validator->fails()){
            return $this->GeneralResponse($validator->errors(),"validation error",'false',400);
        }
        $validated = $validator->validated();
        $category = Category::firstOrCreate(
            ['name' => strtolower(trim($validated['category_name']))]
        );
        unset($validated['category_name']);
        $validated['category_id'] = $category->id;
        $image = $request->file('img');
        $path = $image->store('products', 'public');
        $fullUrl = asset('storage/' . $path);
        $validated['img'] = $fullUrl;
        $validated['admin_id']=auth('admin')->id();
        $product=Product::create($validated);
        if($product){
            return $this->GeneralResponse([],"product created successfully",'true',200);
        }
        return $this->GeneralResponse([],"Error Try again",'false',500);
    }
  /*  public function allProducts($category = null)
    {
        //$products = Product::with('category', 'admin')->paginate(10);
        if(auth('admin')->check())
        {

            if ($category === null) {
                $products = Product::with('category', 'admin')
                    ->where("admin_id", auth('admin')->id())
                    ->paginate(20);
            } else {
                $products = Product::with('category', 'admin')->where('category_id', $category)
                    ->where("admin_id", auth('admin')->id())
                    ->paginate(20);
            }        }
        else
        {
            if ($category === null) {
                $products = Product::with('category')->paginate(20);
            } else {
                $products = Product::with('category')
                    ->where('category_id', $category)
                    ->paginate(20);
            }
        }
        if($products->isEmpty()){
            return $this->GeneralResponse([],"No Products Found",'false',404);
        }
        $products->getCollection()->transform(function ($product) {
            $discount=DB::table('discounts')->where('product_id',$product->id)->first();
            if(isset($discount)){
                $product->discount=$discount->amount;
                $product->newprice = $product->price * (1 - ($discount->amount / 100));
                $product->validto=$discount->valid_to;
            }
            $product->makeHidden(['admin_id', 'category_id']);
            if ($product->relationLoaded('category') && $product->category) {
                $product->category->makeHidden(['id']);
            }
            if ($product->relationLoaded('admin') && $product->admin) {
                $product->admin->makeHidden(['id','email']);
            }
            return $product;
        });
        return $this->GeneralResponse($products,"Products Found",'true',200);
    }*/
    public function allProducts($category = null)
    {
        //$products = Product::with('category', 'admin')->paginate(10);
        if(auth('admin')->check())
        {

            if ($category === null) {
                $products = Product::with('category', 'admin')
                    ->where("admin_id", auth('admin')->id())
                    ->paginate(20);
            } else {
                $products = Product::with('category', 'admin')->where('category_id', $category)
                    ->where("admin_id", auth('admin')->id())
                    ->paginate(20);
            }        }
        else
        {
            if ($category === null) {
                $products = Product::with('category')->paginate(20);
            } else {
                $products = Product::with('category')
                    ->where('category_id', $category)
                    ->paginate(20);
            }
        }
        if($products->isEmpty()){
            return $this->GeneralResponse([],"No Products Found",'false',404);
        }
        $products->getCollection()->transform(function ($product) {
            $discount=DB::table('discounts')->where('product_id',$product->id)->first();
            if(isset($discount)){
                $product->discount=$discount->amount;
                $product->newprice = $product->price * (1 - ($discount->amount / 100));
                $product->validto=$discount->valid_to;
            }
            $product->makeHidden(['admin_id', 'category_id']);
            if ($product->relationLoaded('category') && $product->category) {
                $product->category->makeHidden(['id']);
            }
            if ($product->relationLoaded('admin') && $product->admin) {
                $product->admin->makeHidden(['id','email']);
            }
            return $product;
        });
        return $this->GeneralResponse($products,"Products Found",'true',200);
    }
    public function getProduct($id)
    {
        $product = Product::with('category', 'admin')->where('id',$id)->first();
        if(!$product){
            return $this->GeneralResponse([],"No Products Found",'false',404);
        }
        $discount=DB::table('discounts')->where('product_id',$product->id)->first();
        if($discount){
            $product->discount=$discount->amount;
            $product->newprice = $product->price * (1 - ($discount->amount / 100));
            $product->validto=$discount->valid_to;
        }
        $product->makeHidden(['admin_id', 'category_id']);
        if ($product->relationLoaded('category') && $product->category) {
            $product->category->makeHidden(['id']);
        }
        if ($product->relationLoaded('admin') && $product->admin) {
            $product->admin->makeHidden(['id','email']);
        }
        return $this->GeneralResponse($product,"Products Found",'true',200);
    }
    public function addDiscount($id,Request $request)
    {

    }
    public function getDiscount($product_id)
    {

    }
    public function updateDiscount($product_id)
    {

    }
    public function deleteDiscount($product_id)
    {

    }
    public function updateProduct($id, Request $request)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->GeneralResponse(null, "Product not found", false, 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:250',
            'description' => 'sometimes|string|min:5|max:1500',
            'price' => 'sometimes|numeric|min:0|max:100000',
            'amount' => 'sometimes|numeric|min:1|max:100000',
            'img' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'category_name' => 'sometimes|string|max:250',
        ]);

        if ($validator->fails()) {
            return $this->GeneralResponse($validator->errors(), "Validation error", false, 400);
        }

        $validated = $validator->validated();

        if (isset($validated['category_name'])) {
            $category = Category::firstOrCreate(
                ['name' => strtolower(trim($validated['category_name']))]
            );
            $validated['category_id'] = $category->id;
            unset($validated['category_name']);
        }

        // Handle new image if uploaded
        if ($request->hasFile('img')) {
            $image = $request->file('img');
            $path = $image->store('products', 'public');
            $validated['img'] = asset('storage/' . $path);
        }

        // Update admin_id to the current admin
        $validated['admin_id'] = auth('admin')->id();

        $product->update($validated);

        return $this->GeneralResponse($product, "Product updated successfully", true, 200);
    }

    public function deleteProduct($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return $this->GeneralResponse(null, "Product not found", false, 404);
        }
        $product->orders()->detach();
        $product->users()->detach();

        // Delete the product
        $product->delete();

        return $this->GeneralResponse(null, "Product deleted successfully", true, 200);
    }

    public function allCategories()
    {
        $categories = Category::all();
        return $this->GeneralResponse($categories,"All categories",'true',200);
    }

}
