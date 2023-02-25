# AIWriter

## What is AIWriter?

It is an application that allows you to register WordPress, create a conversation with ChatGPT on the application, add images, edit HTML, and post it as an article to the WordPress of your choice.

- React
- Redux toolkit
- Firebase
- WordPress

It is composed of the following components: ChatGPT API, WordPress Rest API, and Firebase.
WordPress information and ChatGPT APIKey are stored in the Firebase realtime database.

## What you need

- WordPress in operation
- OpenAI ChatGPT APIKey
- Firebase Project

## Preparation

1. install JWT Authentication for WP-API plugin to WordPress, and add the following to wp-config.php.

     define('JWT_AUTH_SECRET_KEY', 'your-top-secret-key');
     define('JWT_AUTH_CORS_ENABLE', true);

2. Install Word Balloon plugin to WordPress and create avatar 1 and avatar 2.

## Execution

git clone
cd
npm install
npm run dev
