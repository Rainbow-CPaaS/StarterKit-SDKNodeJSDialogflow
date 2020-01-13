"use strict";

// Load the SDK for Node.JS
const sdk = require('./app/modules/sdk');
const logger = require('./app/modules/logger');
const router = require('./app/modules/router');

// Load Dialogflow connector
const Dialogflow = require('./app/modules/dialogflow');

// Load configuration
//const bot = require("./app/config/bot.json");

const json = require('comment-json');
const fs = require('fs');
const botfile = fs.readFileSync("./app/config/bot.json");
let txt = botfile.toString();
let bot = json.parse(txt);

json.stringify(bot, null, 2);


const defaultServer = require("./app/config/router.json");

const LOG_ID = "STARTER/INDX - ";

const VCAP_SERVICES = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : undefined;

if (VCAP_SERVICES && VCAP_SERVICES['user-provided']) {
    const rainbow_settings = VCAP_SERVICES['user-provided'].find((setting) => {
        if (Object.keys(setting.credentials).find((entry) => entry.toLowerCase().startsWith('rainbow'))) {
            bot.credentials.login = setting.credentials.rainbow_login;
            bot.credentials.password = setting.credentials.rainbow_password;
            bot.application.appID = setting.credentials.rainbow_appid;
            bot.application.appSecret = setting.credentials.rainbow_appsecret;
            bot.rainbow.host = setting.credentials.rainbow_host;
        }
    });
}

let start = async () => {
    // Start Dialogflow
    await Dialogflow.start();

    // Start the SDK
    await sdk.start(bot, process.argv);

    // Start the router
    await router.start(process.argv, defaultServer, sdk);

    // Link SDK and Dialogflow
    await sdk.configuredialogflow(Dialogflow);

    logger.log("debug", LOG_ID + "starter-kit Dialogflow initialized");
};

start();
