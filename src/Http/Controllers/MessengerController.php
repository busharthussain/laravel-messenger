<?php

namespace bushart\messenger\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use bushart\messenger\Helpers\Messenger;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MessengerController extends Controller
{
    private $data = [], $message = '', $success = false;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->data['users'] = User::where('id', '!=', Messenger::loginId())->get()->toArray();
        $this->data['chatUsers'] = $this->chatUsers();

        return view('messenger.index', $this->data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \GuzzleHttp\Exception\GuzzleException
     */
    public function store(Request $request)
    {
        try {
            $data = $request->all();
            if (empty($data['message']) && empty($data['file'])) {
                $this->message = "Please enter a message or select a file to send.";
            } else {
                if ($request->hasFile('file')) {
                    $image = Messenger::uploadFile($request, 'file', 'laravel-messenger/uploads');
                    $data['file'] = !empty($image) ? $image['file'] : '';
                    $data['file_original_name'] = !empty($image) ? $image['file_original_name'] : '';
                    $data['file_type'] = !empty($image) ? $image['file_type'] : '';
                    $data['file_size'] = !empty($image) ? $image['file_size'] : '';
                }
                Messenger::createMessage($data);
                $this->success = true;
                $this->message = "Message sent successfully.";
            }
        } catch (\Exception $exception) {
            $this->message = $exception->getMessage();
        }

        return response()->json(['success' => $this->success, 'message' => $this->message]);
    }

    /**
     * Update messenger mode Dark/light
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMessengerMode(Request $request)
    {
        try {
            $data = $request->all();
            User::where('id', Messenger::loginId())->update(['messenger_mode' => $data['messenger_mode']]);
            $this->success = true;
            $this->message = 'Mode updated successfully.';
        } catch (\Exception $exception) {
            $this->message = $exception->getMessage();
        }

        return response()->json(['success' => $this->success, 'message' => $this->message]);
    }

    /**
     * Make message seen
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function messageSeen(Request $request)
    {
        try {
            $data = $request->all();
            Message::where('receiver_id', $data['receiver_id'])
                ->where('sender_id', Messenger::loginId())
                ->where('is_seen', 0)
                ->update(['is_seen' => 1]);
            $this->success = true;
            $this->message = 'Mode updated successfully.';
        } catch (\Exception $exception) {
            $this->message = $exception->getMessage();
        }

        return response()->json(['success' => $this->success, 'message' => $this->message]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        try {
            $data = $request->all();
            $columnName = !empty($data['chat_id']) ? 'chat_id' : 'id';
            $columnValue = !empty($data['chat_id']) ? $data['chat_id'] : $data['id'];
            $obj = Message::select('delete_user_id')->where($columnName, $columnValue)->first();
            if (empty($obj->delete_user_id)) {
                Message::where($columnName, $columnValue)->update(['delete_user_id' => Messenger::loginId()]);
            } else {
                Message::where($columnName, $columnValue)->delete();
            }
            $this->success = true;
            $this->message = 'Chat deleted successfully';
        } catch (\Exception $exception) {
            $this->message = $exception->getMessage();
        }

        return response()->json(['success' => $this->success, 'message' => $this->message]);
    }

    /**
     * Get selected user record
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUser(Request $request)
    {
        $data = $request->all();
        if (!empty($data['user_id'])) {
            $userId = $data['user_id'];
            $user = Message::select('users.*', 'messages.chat_id', 'messages.message', 'messages.sender_id', 'messages.receiver_id')
                ->join('users', function ($join) {
                    $join->on('messages.sender_id', '=', 'users.id')
                        ->orOn('messages.receiver_id', '=', 'users.id');
                })
                ->where(function ($q) use ($userId) {
                    $q->where('messages.sender_id', $userId)
                        ->orWhere('messages.receiver_id', $userId);
                })
                ->where('users.id', '!=', Messenger::loginId())
                ->where('messages.sender_id', Messenger::loginId())
                ->where('messages.delete_user_id', '!=', Messenger::loginId())
                ->latest()
                ->first();
            if (empty($user)) {
                $user = User::find($userId);
            }

            $chatId = !empty($user->chat_id) ? $user->chat_id : Messenger::generateChatId();
            $this->data['user_id'] = $userId;
            $this->data['user_avatar_name'] = Messenger::nameLetters($userId);
            $this->data['user_name'] = $user->name;
            $this->data['message'] = !empty($user->message) ? $user->message : 'Click to start conversation.';
            $this->data['chat_id'] = $chatId;
            $this->data['unseenMessages'] = Message::unseenMessages($user);
            $this->getChatData($chatId);
            $this->data['conversation'] = view('messenger.partials._conversation', $this->data)->render();
        }

        return response()->json(['data' => $this->data]);
    }

    /**
     * Get user conversation
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserConversation(Request $request)
    {
        $data = $request->all();
        if (!empty($data['chat_id'])) {
            $user = User::find($data['user_id']);
            $this->data['user_id'] = $data['user_id'];
            $this->data['user_avatar_name'] = Messenger::nameLetters($data['user_id']);
            $this->data['user_name'] = $user->name;
            $this->data['chat_id'] = $data['chat_id'];
            $this->getChatData($data['chat_id']);
            $this->data['conversation'] = view('messenger.partials._conversation', $this->data)->render();
        }

        return response()->json(['data' => $this->data]);
    }

    /**
     * Get chat data
     *
     * @param $chatId
     * @return array
     */
    private function getChatData($chatId)
    {
        $loginId = Messenger::loginId();
        $messages = Message::where('chat_id', $chatId)->where('delete_user_id', '!=', $loginId)->orderBy('created_at')->get()->toArray();
        Message::where('chat_id', $chatId)->where('sender_id', '<>', $loginId)->update(['is_seen' => 1]);
        $messagesData = [];
        foreach ($messages as $key => $row) {
            $messagesData[$key] = $row;
            $messagesData[$key]['is_send'] = $row['sender_id'] == $loginId ? 1 : 0;
            $messagesData[$key]['message_file'] = !empty($row['file']) ? Messenger::getStoragePath($row['file']) : '';
            $messagesData[$key]['message_time'] = Carbon::parse($row['created_at'])->format('g:i a');
        }
        $this->data['messages'] = $messagesData;

        return $this->data;
    }

    /**
     * Chat users
     *
     * @return mixed
     */
    private function chatUsers()
    {
        return Message::fetchChatUsers();
    }
}