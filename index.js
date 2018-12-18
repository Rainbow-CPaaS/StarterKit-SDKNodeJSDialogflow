"use strict";

// Load the SDK for Node.JS
const sdk       = require('./app/modules/sdk');
const logger    = require('./app/modules/logger');
const router    = require('./app/modules/router');

// Load Dialogflow connector
const Dialogflow = require('./app/modules/dialogflow');

// Load configuration
const bot = require("./app/config/bot.json");
const defaultServer = require("./app/config/router.json");

const LOG_ID = "STARTER/INDX - ";

const VCAP_SERVICES = process.env.VCAP_SERVICES ? JSON.parse(process.env.VCAP_SERVICES) : undefined;

if( VCAP_SERVICES && VCAP_SERVICES['user-provided']) {
    const rainbow_settings = VCAP_SERVICES['user-provided'].find( (setting) => {
        if( Object.keys(setting.credentials).find( (entry) => entry.toLowerCase().startsWith('rainbow') )) {
            bot.credentials.login = setting.credentials.rainbow_login;
            bot.credentials.password = setting.credentials.rainbow_password;
            bot.application.appID = setting.credentials.rainbow_appid;
            bot.application.appSecret = setting.credentials.rainbow_appsecret;
            bot.rainbow.host = setting.credentials.rainbow_host;
        }
    });
}

// Start the SDK
sdk.start(bot, process.argv).then(() => {
    // Start the router
    return router.start(process.argv, defaultServer, sdk);
}).then(() => {
    // Start Dialogflow
    return Dialogflow.start();
}).then( () => {
    // Link SDK and Dialogflow
    sdk.configuredialogflow(Dialogflow);
}).then(() => {
    logger.log("debug", LOG_ID + "starter-kit Dialogflow initialized");
});
