<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Traits\Response;
class AdminController extends Controller
{
    use Response;


    public function login(Request $request)
    {
        //validation
        $validator=Validator::make($request->all(),[
            'email'=>'required|exists:admins,email',
            'password'=>'required'
        ]);
        if($validator->fails()){
            return $this->GeneralResponse($validator->errors(),"Validation Error use valid email and password",'false',401);
        }
        if(!$token = auth('admin')->attempt($validator->validated()))
        {
            return $this->GeneralResponse($validator->errors(),"invalid email or password",'false',401);
        }
        return $this->GeneralResponse([
            "token"=>$token,
            'user'=>auth('admin')->user(),
        ]);
    }
    public function logout()
    {
        auth('admin')->logout();
    }
}
