FROM node:6.9.2

RUN apt-get update && apt-get install git && git clone https://github.com/Py64/node-lamobot.git && cd /node-lamobot && npm install