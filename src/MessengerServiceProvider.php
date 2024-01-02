<?php

namespace bushart\messenger;

use bushart\messenger\Helpers\Messenger;
use bushart\messenger\Console\InstallCommand;
use bushart\messenger\Console\PublishCommand;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class MessengerServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('Messenger', function() {
            return new Messenger;
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        // Load Views and Routes
        $this->loadViewsFrom(__DIR__ . '/views', 'messenger');
        $this->loadRoutes();

        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
                PublishCommand::class,
            ]);
            $this->setPublishes();
        }
    }

    /**
     * Publishing the files that the user may override.
     *
     * @return void
     */
    protected function setPublishes()
    {
        // Config
        $this->publishes([
            __DIR__ . '/config/messenger.php' => config_path('messenger.php')
        ], 'messenger-config');

        // Migrations
        $this->publishes([
            __DIR__ . '/database/migrations/2023_12_22_999999_add_is_active_users_table.php' => database_path('migrations/' . date('Y_m_d') . '_999999_add_is_active_users_table.php'),
            __DIR__ . '/database/migrations/2023_12_18_999999_create_messages_table.php' => database_path('migrations/' . date('Y_m_d') . '_999999_create_messages_table.php'),
            __DIR__ . '/database/migrations/2023_12_30_999999_add_messenger_mode_to_users_table.php' => database_path('migrations/' . date('Y_m_d') . '_999999_add_messenger_mode_to_users_table.php'),
        ], 'messenger-migrations');

        // Models
        $isV8 = explode('.', app()->version())[0] >= 8;
        $this->publishes([
            __DIR__ . '/Models' => app_path($isV8 ? 'Models' : '')
        ], 'messenger-models');

        // Controllers
        $this->publishes([
            __DIR__ . '/Http/Controllers' => app_path('Http/Controllers/vendor/Messenger')
        ], 'messenger-controllers');

        // Views
        $this->publishes([
            __DIR__ . '/views' => resource_path('views/vendor/')
        ], 'messenger-views');

        // Assets
        $this->publishes([
            // CSS
            __DIR__ . '/assets/css' => public_path('laravel-messenger/css'),
            // JavaScript
            __DIR__ . '/assets/js' => public_path('laravel-messenger/js'),
            // Fonts
            __DIR__ . '/assets/fonts' => public_path('laravel-messenger/fonts'),
            // Images
            __DIR__ . '/assets/images' => public_path('laravel-messenger/images'),
            // Lib
            __DIR__ . '/assets/libs' => public_path('laravel-messenger/libs'),
        ], 'messenger-assets');
    }

    /**
     * Group the routes and set up configurations to load them.
     *
     * @return void
     */
    protected function loadRoutes()
    {
        Route::group($this->routesConfigurations(), function () {
            $this->loadRoutesFrom(__DIR__ . '/routes/web.php');
        });
    }

    /**
     * Routes configurations.
     *
     * @return array
     */
    private function routesConfigurations()
    {
        return [
            'prefix' => config('messenger.routes.prefix'),
            'namespace' =>  config('messenger.routes.namespace'),
            'middleware' => config('messenger.routes.middleware'),
        ];
    }
}