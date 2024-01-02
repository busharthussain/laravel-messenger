<?php

namespace App\Models;

use bushart\messenger\Helpers\Messenger;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Message extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    /**
     * Fetch chat users
     *
     * @return mixed
     */
    protected static function fetchChatUsers()
    {
        return Message::select('users.*', 'messages.chat_id', 'messages.message', 'messages.file')
            ->join('users', function ($join) {
                $join->on('messages.sender_id', '=', 'users.id')
                    ->orOn('messages.receiver_id', '=', 'users.id');
            })
            ->join(DB::raw('(SELECT MAX(created_at) as latest_created_at, chat_id FROM messages GROUP BY chat_id) as latest_messages'), function ($join) {
                $join->on('messages.chat_id', '=', 'latest_messages.chat_id')
                    ->on('messages.created_at', '=', 'latest_messages.latest_created_at');
            })
            ->where(function ($q) {
                $q->where('messages.sender_id', Messenger::loginId())
                    ->orWhere('messages.receiver_id', Messenger::loginId());
            })
            ->where('users.id', '!=', Messenger::loginId())
            ->where('messages.delete_user_id', '!=', Messenger::loginId())
            ->orderBy('messages.created_at', 'desc')
            ->get()->toArray();
    }

    /**
     * Unseen messages
     *
     * @param $userId
     * @return
     */
    protected static function unseenMessages($userId)
    {
        return Message::where('receiver_id', Messenger::loginId())->where('sender_id', $userId)->where('is_seen', 0)->count();
    }
}