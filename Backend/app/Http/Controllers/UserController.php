<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Traits\Response;
class UserController extends Controller
{
    //
    use Response;
    public function signup(Request $request)
    {
        //validation
        $validator=Validator::make($request->all(),[
            'fname'=>"required|string",
            'lname'=>"required|string",
            'user_name'=>"required|string|unique:users,user_name",
            'email'=>"required|string|unique:users,email",
            'password'=>"required|min:6|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/",
            'gender'=>"required|in:male,female",
            'img'=>"image|mimes:jpeg,png,jpg,gif|max:2048",
        ]);
        if($validator->fails()){
            return $this->GeneralResponse($validator->errors(),"Validation errors",false,401);
        }
        $validated=$validator->validated();
       if($request->hasFile('img')){
           $image = $request->file('img');
           $path = $image->store('users', 'public');
           $fullUrl = asset('storage/' . $path);
           $validated['img']= $fullUrl;
       }
       $validated['password']=Hash::make($validated['password']);
        $user=User::create($validated);
       if($user){
           $token=auth('api')->login($user);
           return $this->GeneralResponse([
               'token'=>$token,
               'user'=>$user,
           ],"User created successfully");
       }
       return $this->GeneralResponse([],"User not created Try again",false,401);
    }
    public function login(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'login'=>"required|string",
            'password'=>"required|string",
        ]);
        if($validator->fails()){
            return $this->GeneralResponse($validator->errors(),"in valid data",false,401);
        }
        $login_type = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'user_name';
        $credentials = [
            $login_type => $request->login,
            'password' => $request->password,
        ];
        if($token=auth('api')->attempt($credentials)){
            return $this->GeneralResponse(['token'=>$token,'user'=>auth('api')->user()],"User successfully logged in",true,200);
        }
        return $this->GeneralResponse($token,"failed to login user try again with valid data",false,401);
    }
    public function logout()
    {
        auth('api')->logout();
    }
}
