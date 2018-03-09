#!/bin/bash

echo "copying public files..."
cp -R ../public/* www

echo "which config do you want to use for websocket configuration (default: \"prod\") ?"
read conf

if [ -z "$conf" ]; then
  conf="prod"
fi

echo "copying the content of index.html in www/index.html using \"$conf\" config"
curl "http://127.0.0.1:8000?cordova=true&config=$conf" > www/index.html

if [[ $(head -n 1 www/index.html) ]]; then

    echo "spreading changes to cordova platforms..."
    cordova prepare

    echo "-> copy finished, ready to build."

else

    echo "### ERROR: node server is not running -> ./www/index.html empty. COPY ABORTED"

fi
