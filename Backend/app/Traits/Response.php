<?php
namespace App\Traits;
Trait Response {
    protected Function GeneralResponse($data=[],$message="Success operation",$success=true,$status=200){
        return response()->json([
            "message"=>$message,
            "data"=>$data,
            "success"=>$success,
        ])->setStatusCode($status);
    }
}
