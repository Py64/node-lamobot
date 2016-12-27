FROM node:6.9.2

RUN apt-get update && apt-get install git && git clone https://gitlab.com/Pyy/node-lamobot.git && cd /node-lamobot && npm install