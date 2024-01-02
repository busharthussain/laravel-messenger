<?php

use Illuminate\Support\Facades\Route;

Route::get('', 'App\Http\Controllers\MessengerController@index')->name(config('messenger.routes.prefix'));
Route::post('messenger/store', 'App\Http\Controllers\MessengerController@store')->name('messenger.store');
Route::get('messenger/user', 'App\Http\Controllers\MessengerController@getUser')->name('user.select');
Route::get('messenger/user/conversation', 'App\Http\Controllers\MessengerController@getUserConversation')->name('user.conversation');
Route::delete('message/delete', 'App\Http\Controllers\MessengerController@destroy')->name('message.delete');
Route::post('messenger/mode/update', 'App\Http\Controllers\MessengerController@updateMessengerMode')->name('messenger.mode.update');
Route::post('messenger/message/seen', 'App\Http\Controllers\MessengerController@messageSeen')->name('messenger.message.seen');