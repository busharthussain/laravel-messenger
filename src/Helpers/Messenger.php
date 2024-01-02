<?php

namespace bushart\messenger\Helpers;


use App\Models\Message;
use App\Models\User;
use Carbon\Carbon;
use Google\Cloud\Storage\StorageClient;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Pusher\Pusher;

class Messenger
{
    /**
     * Get login user Id
     *
     * @return mixed
     */
    public static function loginId()
    {
        $id = 0;
        if (Auth::check()) {
            $id = Auth::user()->id;
        }

        return $id;
    }

    /**
     * Get First letters from user name
     *
     * @param $id
     * @return string
     */
    public static function nameLetters($id)
    {
        $initials = '';
        $user = User::find($id);
        if ($user) {
            $initials = collect(explode(' ', $user->name))->map(function ($item) {
                return strtoupper($item[0]);
            })->implode('');
        }

        return $initials;
    }

    /**
     * Get unseen messages of selected user
     *
     * @param $userId
     * @return mixed
     */
    public static function getUnseenMessagesCount($userId)
    {
        return Message::unseenMessages($userId);
    }

    /**
     * generate chat id
     *
     * @return string
     */
    public static function generateChatId()
    {
        $timestamp = now()->timestamp;
        $randomNumber = mt_rand(100000, 999999);

        $chatId = $timestamp . $randomNumber;

        // Ensure the chat ID is exactly 12 digits
        $chatId = str_pad($chatId, 12, '0', STR_PAD_RIGHT);

        return $chatId;
    }

    /**
     * Upload file
     *
     * @param $request
     * @param $input
     * @param $path
     * @return array
     */
    public static function uploadFile($request, $input, $path)
    {
        $arr = [];
        if ($request->hasFile($input)) {
            $file = $request->file($input);
            // Get file size in bytes
            $fileSize = $file->getSize();

            $arr[$input] = $fileName = 'laravel-messenger-' . time() . '-' . uniqid(rand()) . '.' . $file->extension();
            $arr[$input . '_original_name'] = $request->$input->getClientOriginalName();
            $arr['file_type'] = '.' . str_replace('.', '' , $file->extension());
            $arr['file_size'] = self::formatSizeUnits($fileSize);
            $storageType = config('messenger.storage_disk_name');
            if ($storageType == 'public') {
                $destinationPath = public_path($path);
                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0777, true);
                }

                $file->move($destinationPath, $fileName);
            }
            if ($storageType == 'google') {
                $storage = new StorageClient([
                    'projectId' => env('GOOGLE_CLOUD_PROJECT_ID'),
                    'keyFilePath' => public_path(env('GOOGLE_CLOUD_KEY_FILE')),
                ]);

                $bucket = $storage->bucket(env('GOOGLE_CLOUD_BUCKET'));
                $bucket->upload(fopen($file, 'r+'), [
                    'name' => $path . '/' . $fileName,
                    'predefinedAcl' => 'publicRead',
                ]);
            }
            if ($storageType == 's3') {
                $s3ImageUrl = Storage::disk('s3')->putFileAs($path, $file, $fileName);
                Storage::disk('s3')->url($s3ImageUrl);
            }
        }

        return $arr;
    }

    /**
     * Function to convert bytes to a human-readable format
     *
     * @param $bytes
     * @return string
     */
    private static function formatSizeUnits($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return sprintf("%.2f", $bytes) . ' ' . $units[$i];
    }

    /**
     * Get gile icons
     *
     * @param $extension
     * @return string
     */
    public static function getFileIcon($extension)
    {
        $fileIcons = config('messenger.file_icons');
        $extension = strtolower(str_replace('.', '', $extension));

        return $fileIcons[$extension] ?? 'far fa-file'; // Default icon if extension not found
    }

    /**
     * Create new message
     *
     * @param $data
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Pusher\ApiErrorException
     * @throws \Pusher\PusherException
     */
    public static function createMessage($data)
    {
        $objMessage = new Message();
        $objMessage->sender_id = self::loginId();
        $objMessage->receiver_id = $data['receiver_id'];
        $objMessage->chat_id = $data['chat_id'];
        if (!empty($data['message'])) {
            $objMessage->message = $data['message'];
        }
        if (!empty($data['file'])) {
            $objMessage->file = $data['file'];
            $objMessage->file_original_name = $data['file_original_name'];
            $objMessage->file_type = $data['file_type'];
            $objMessage->file_size = $data['file_size'];
        }
        $objMessage->save();

        self::triggerPusher('messenger-' . $data['chat_id'], 'chatEvent', [
            'receiver_id' => $data['receiver_id'],
            'messages' => self::getLatestMessage($data['chat_id']),
            'user_avatar_name' => self::nameLetters($data['receiver_id']),
        ]);
    }

    /**
     * Latest message
     *
     * @param $chatId
     * @return array
     */
    private static function getLatestMessage($chatId)
    {
        $loginId = self::loginId();
        $message = Message::where('chat_id', $chatId)->latest()->first();
        $arrMessages = [];
        if (!empty($message)) {
            $message->is_send = $message->sender_id == $loginId ? 1 : 0;
            $message->message_time = Carbon::parse($message->created_at)->format('g:i a');
            $message->message_file = !empty($message->file) ? self::getStoragePath($message->file) : '';
            $arrMessages = $message->toArray();
        }

        return $arrMessages;
    }

    /**
     * Get storage file path
     *
     * @param $file
     * @return string
     */
    public static function getStoragePath($file)
    {
        $storagePath = '';
        $storageType = config('messenger.storage_disk_name');
        if ($storageType == 'public') {
            $storagePath = asset('laravel-messenger/uploads');
        }
        if ($storageType == 'google') {
            $storagePath = 'https://storage.googleapis.com/' . getenv('GOOGLE_CLOUD_BUCKET') . '/laravel-messenger/uploads';
        }
        if ($storageType == 's3') {
            $storagePath = 'https://' . getenv('AWS_BUCKET') . '.s3.' . getenv('AWS_DEFAULT_REGION') . '.amazonaws.com/laravel-messenger/uploads';
        }
        $filePath = $storagePath . '/' . $file;

        return $filePath;
    }

    /**
     * Trigger the pusher to save messages
     *
     * @param $channel
     * @param $event
     * @param $data
     * @return object
     * @throws \GuzzleHttp\Exception\GuzzleException
     * @throws \Pusher\ApiErrorException
     * @throws \Pusher\PusherException
     */
    public static function triggerPusher($channel, $event, $data)
    {
        $pusher = new Pusher(
            config('messenger.pusher.key'),
            config('messenger.pusher.secret'),
            config('messenger.pusher.app_id'),
            config('messenger.pusher.options')
        );

        return $pusher->trigger($channel, $event, $data);
    }
}
