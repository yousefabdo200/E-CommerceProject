<?php

use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use \App\Http\Controllers\OrderController;

//admin Routes
Route::get('all/product/category',[ProductController::class,'allCategories']);
Route::get('all/product/{category?}',[ProductController::class,'allProducts']);
Route::prefix("admin")->group(function () {
    Route::post('/login',[AdminController::class,'login']);

    Route::prefix("product")->middleware(['auth:admin'])->controller(ProductController::class)->group(function () {
       Route::post('/','createProduct');
        Route::get('/{id}','getProduct');
        Route::put('/{id}','updateProduct');
        Route::delete('/{id}','deleteProduct');
       Route::prefix("{productId}/discount")->group(function () {
              Route::post('/','addDiscount');
              Route::get('/','getDiscount');
              Route::put('/','updateDiscount');
              Route::delete('/','deleteDiscount');
       });

   });
    Route::prefix('/order')->controller(OrderController::class)->group(function ()
    {
        Route::get('/','allOrders');
        Route::get('/{id}','getOrder');
        Route::put('/{id}/accept', 'acceptOrder');
        Route::put('/{id}/reject', 'rejectOrder');
    });
    Route::get('logout',[AdminController::class,'logout']);
});
Route::prefix("user")->group(function () {
    Route::post('/login',[UserController::class,'login']);
    Route::post('/logout',[UserController::class,'logout']);
    Route::post('/signup',[UserController::class,'signup']);
    Route::middleware(['auth:api'])->group(function () {
        Route::prefix("product")->controller(ProductController::class)->group(function () {
            Route::get('/','allProducts');
        });
        Route::prefix('/cart')->controller(CartController::class)->group(function () {
            Route::get('/','cartItems');
            Route::post('/','addToCart');
            Route::put('/{product_id}','decreaseCartItems');
            Route::delete('/{product_id}','removeCartItem');
            Route::delete('/','removeCart');
        });
        Route::prefix('/order')->controller(OrderController::class)->group(function ()
        {
            Route::get('/','allUserOrders');
            Route::post('/','createOrder');
            Route::get('/{id}','getOrder');
        });
    });
});
