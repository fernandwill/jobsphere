<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', DashboardController::class)->name('home');

Route::prefix('auth')->name('oauth.')->group(function () {
    Route::get('{provider}/redirect', [AuthController::class, 'redirect'])
        ->whereIn('provider', ['github', 'google'])
        ->name('redirect');

    Route::get('{provider}/callback', [AuthController::class, 'callback'])
        ->whereIn('provider', ['github', 'google'])
        ->name('callback');
});

Route::post('logout', [AuthController::class, 'logout'])
    ->middleware('auth')
    ->name('logout');
