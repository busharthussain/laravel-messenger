<p style="text-align:center;width:100%;"><img src="/art/preview.jpg" alt="Laravel Messenger"></p>

## Laravel Messenger

Laravel's #1 one-to-one chatting system package, helps you add a complete real-time chatting system to your new/existing Laravel application with only one command.

## Need a Help? 📣

I have created a server for *Laravel Messenger* on `Discord` to let you *up-to-date* and help you as much as I can .. so now you can chat with me, get a help, showcases, and most importantly to get announcements and updates about *Laravel Messenger*.

So, https://discord.gg/JSTUHUfA and keep updated.

## Features

- One-to-one users chat system.
- Real-time contact list updates.
- Search functionality.
- Contact item's last message indicator (e.g. You: ....).
- Real-time message seen indicator.
- Upload attachments.
- Upload attachments to public, Google and Amazon aws S3 bucket. (By default it is public, you can update it in the config file)
- Send Emoji's.
- Delete Messages and chat
- Responsive design with all devices.
  with simple and wonderful UI design.

...and much more you have to discover it yourself.

<!-- - ## Demo -->

<!-- - - Demo app - https://github.com/munafio/chatify-demo.-->
<!-- - Demo video on YouTube - https://youtu.be/gjo74FUJJPI -->

### Documentation

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Generators](#generators)


## Installation

#### Step 1: Install Laravel
This is optional; however, if you have not created the laravel app, then you may go ahead and execute the below command:

```
composer create-project laravel/laravel example-app
```

#### Step 2: Setup Database Configuration

After successfully installing the laravel app then after configuring the database setup. We will open the ".env" file and change the database name, username and password in the env file.

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=Enter_Your_Database_Name
DB_USERNAME=Enter_Your_Database_Username
DB_PASSWORD=Enter_Your_Database_Password
```

#### Step 3: Install Auth Scaffold

Install Laravel breeze for quick auth start up
```
composer require laravel/breeze --dev
```

After Composer has installed the Laravel Breeze package, you may run the ```breeze:install``` Artisan command. This command publishes the authentication views, routes, controllers, and other resources to your application. Laravel Breeze publishes all of its code to your application so that you have full control and visibility over its features and implementation.


The ```breeze:install``` command will prompt you for your preferred frontend stack and testing framework:

```
php artisan breeze:install


php artisan migrate

npm install

npm run dev
```

### Package Installation

Add the package in your composer.json by executing the following command.

```
composer require bushart/laravel-messenger
```

This will install the [Pusher](https://pusher.com/) package too.

So update the .env file.
```
BROADCAST_DRIVER=log to BROADCAST_DRIVER=pusher

PUSHER_APP_ID="Pusher App Id"
PUSHER_APP_KEY="Pusher provided app key"
PUSHER_APP_SECRET="Pusher provided app secret"
PUSHER_APP_CLUSTER="The app cluster you select on creating app on pusher"
``` 

#### Install Messenger
All you need is to run the following command to setup everything for you:

```
php artisan messenger:install
```


This command will automatically do the following:
 - Some configurations.
 
 - Publishing the assets (config, views, assets, models, migrations).

#### Migration
Run the following command to run the migrations.

```
php artisan migrate
```

After installing the package, you can access the messenger by the default path(routes prefix) which is /messenger, and you can change path name in the config file config/messenger.php as mentioned in the configurations below.


##Configurations

You can find package's configuration file at config/messenger.php in your application, and will find the following properties that you can modify inside it:

#### Display Name
This value is the name for the messenger displayed in the UI

```
'name' => env('MESSENGER_NAME', 'Laravel Messenger'),
```

#### Files upload disk

- Define the default storage disk for file uploads: 

- Set to 'google' or 's3' to use Google Cloud Storage or Amazon S3 respectively,

- or leave as 'public' to use the default local filesystem storage.
```
'storage_disk_name' => env('MESSENGER_STORAGE_DISK', 'public'),
```

If you want to use Google to upload files. You will have to install the google cloud to your project.

```
composer require google/cloud-storage
```

If you want to use AWS S3 for upload file. You will have to install the aws s3 sdk to your project.

```
composer require league/flysystem-aws-s3-v3
```

#### File Icons Configuration (Excluding Images and Videos)

Define file extensions and their respective icons to display for uploaded files (excluding images and videos).

```
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
```

#### Routes' Configurations

This value is package's routes' configuration

```
'routes' => [
        'prefix' => env('MESSENGER_ROUTES_PREFIX', 'messenger'),
        'middleware' => env('MESSENGER_ROUTES_MIDDLEWARE', ['web','auth']),
        'namespace' => env('MESSENGER_ROUTES_NAMESPACE', 'bushart\messenger\Http\Controllers'),
    ],
```

```prefix``` is the prefix of the routes in this package, so you can access the messenger from this value by going to ```/messenger```.

#### Pusher configurations

From here you can change pusher's configurations,

```
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
```

## Customizations
You may want to do your own customizations and modifications on the code such as the views or the controllers to add a new feature. so, all you need is to publish the required asset mentioned below and start your own customizations!

#### Package's assets
- ```config```
- ```views```
- ```assets(css,js,images, libs)```
- ```models```
- ```migrations```
- ```controllers```

The following assets already been published during the installation process:
config, views, assets, models, migrations
only the controllers asset is not published until you do.

#### Publishing the assets

When you need to publish an asset, all you need is to run the following command :

```php artisan vendor:publish --tag=messenger-<asset-name>```

###### Change<asset-name> with the required asset name (e.g. css) to be like messenger-css

#### Controllers

You may want to do some modifications on the controllers of this package, so you need to follow the steps below:

1. Publish ```controllers``` asset

```php artisan vendor:publish --tag=messenger-controllers```

2. Go to config/messenger.php and from routes properties, change namespace to App\Http\Controllers\Bushart\Messenger to be like the following:

```
config/messenger.php

...
 'namespace' => env('MESSENGER_ROUTES_NAMESPACE', 'bushart\messenger\Http\Controllers'),
```

3. Go to app\Http\Controllers\Bushart\Messenger and open MessengerController.php with your code editor .. 
then change the namespace to the same namespace specified in the step 2 above .. 


That's all you need to do.

Now, You can work with package's controller and start your modifications.


## Upgrading Messenger
When upgrading to any new Chatify version, you should re-publish Messenger's assets:

```php artisan messenger:publish```

To keep the assets up-to-date and avoid issues in future updates, you may add the messenger:publish command to the post-update-cmd scripts in your application's ```composer.json file```:

```
composer.json


{
    "scripts": {
        "post-update-cmd": [
            "@php artisan messenger:publish --ansi"
        ]
    }
}
```


## Author
- [Bushart Hussain](https://www.kiswatech.com)

## License

Laravel Messenger is licensed under the https://choosealicense.com/licenses/mit/