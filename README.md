# Lamobot
__Bot made to make feeding [llamas](https://lamy.cos.ovh) easier.__ *(via Hitbox)*

[![GitHub issues](https://img.shields.io/github/issues/Py64/node-lamobot.svg)](https://github.com/Py64/node-lamobot/issues)
[![David](https://img.shields.io/david/Py64/node-lamobot.svg)](https://david-dm.org/Py64/node-lamobot)
[![David](https://img.shields.io/david/dev/Py64/node-lamobot.svg)](https://david-dm.org/Py64/node-lamobot)
[![Build Status](https://travis-ci.org/Py64/node-lamobot.svg?branch=master)](https://travis-ci.org/Py64/node-lamobot)

## Dependencies
* NodeJS v7.1.0
* Request v2.79.0
* ws v1.1.1
* [node-logger](https://github.com/Py64/node-logger.git) *latest*
* Standard v8.6.0 *(dev)*
* mocha v3.2.0 *(dev)*

## Configuration
The configuration is in json. More informations in documentation.

Currently you can change only these settings per channel:

* messages
* user
* command aliases
* enabled commands (to change the naming either create aliases or modify the code)
* command prefix
* name color

Remember that there can be only one whispers bot per account.

You have to set the Llama API endpoint and token. You can get both by asking me (but I can host the bot for you). However, your access to API may be limited if the bot is not flagged as official. Unofficial bots can only buy hay or bamboo as themselves (or users who authorized the application) and access any user points amount (which does not need authorization).

## Contents
This repository contains basic library which allows to connect to a Hitbox chat server and receive and send messages.

You'll find also simple code made to use [lamy](https://lamy.cos.ovh) API which currently lets you feed llamas & pandas, get user's points state and give points.

Index.js file contains code of the Lamobot - which will log in onto all users specified in the config and make connections to Hitbox websocket server, listen for commands and do what it has to do. It will also send message to all configured channels when someone feeds successfuly.

Default configuration contains all message strings in Polish as the bot is directed to Polish users.

## Pull requests
Any pull request will be welcome.

## What is not implemented yet?
The bot still may throw "unimplemented message" into the log as it still does not ignore sticky messages, banned/unbanned/kicked notifications and new subscriber info message.

Any token will be accepted by the bot as it does not check is the token valid. However, server will reject unauthorized requests.

[![Standard - JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)