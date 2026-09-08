<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Auto-load All Module Routes
|--------------------------------------------------------------------------
*/

foreach (glob(__DIR__ . '/modules/*.php') as $filename) {
    require $filename;
}


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
