<?php

use Illuminate\Support\Facades\Route;

Route::get('', 'MessengerController@index')->name(config('messenger.routes.prefix'));
Route::post('messenger/store', 'MessengerController@store')->name('messenger.store');
Route::get('messenger/user', 'MessengerController@getUser')->name('user.select');
Route::get('messenger/user/conversation', 'MessengerController@getUserConversation')->name('user.conversation');
Route::delete('message/delete', 'MessengerController@destroy')->name('message.delete');
Route::post('messenger/mode/update', 'MessengerController@updateMessengerMode')->name('messenger.mode.update');
Route::post('messenger/message/seen', 'MessengerController@messageSeen')->name('messenger.message.seen');