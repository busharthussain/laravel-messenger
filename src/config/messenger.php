<?php

return [
    /*
    |-------------------------------------
    | Messenger display name
    |-------------------------------------
    */
    'name' => env('MESSENGER_NAME', 'Laravel Messenger'),

    /*
    |-------------------------------------
    | The disk on which to store added
    | files and derived images by default.
    |
    |
    | Replace "public" by google or s3 according to your choice
    |-------------------------------------
    */
    'storage_disk_name' => env('MESSENGER_STORAGE_DISK', 'public'),

    /*
    |-------------------------------------
    | File icons mappings
    | Maps file extensions to their corresponding font-awesome icons
    |-------------------------------------
    */
    'file_icons' => [
        'pdf' => 'far fa-file-pdf',
        'doc' => 'far fa-file-word',
        'docx' => 'far fa-file-word',
        'xls' => 'far fa-file-excel',
        'xlsx' => 'far fa-file-excel',
        'ppt' => 'far fa-file-powerpoint',
        'pptx' => 'far fa-file-powerpoint',
        'txt' => 'far fa-file-alt',
        'csv' => 'far fa-file-csv',
        'ai' => 'far fa-file-illustrator',
        'psd' => 'far fa-file-photoshop',
        'zip' => 'far fa-file-archive',
        'rar' => 'far fa-file-archive',
        // Add more file extensions and their corresponding icons here
    ],

    /*
    |-------------------------------------
    | Routes configurations
    |-------------------------------------
    */
    'routes' => [
        'prefix' => env('MESSENGER_ROUTES_PREFIX', 'messenger'),
        'middleware' => env('MESSENGER_ROUTES_MIDDLEWARE', ['web','auth']),
        'namespace' => env('MESSENGER_ROUTES_NAMESPACE', 'bushart\messenger\Http\Controllers'),
    ],

    /*
    |-------------------------------------
    | Pusher API credentials
    |-------------------------------------
    */
    'pusher' => [
        'debug' => env('APP_DEBUG', false),
        'key' => env('PUSHER_APP_KEY'),
        'secret' => env('PUSHER_APP_SECRET'),
        'app_id' => env('PUSHER_APP_ID'),
        'options' => [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'encrypted' => env('PUSHER_APP_USETLS'),
        ],
    ],
];
