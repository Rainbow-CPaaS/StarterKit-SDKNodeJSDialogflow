
const logger = require('./logger');
const LOG_ID = "STARTER/DIALOGFLOW - ";

const dialogflow = require('dialogflow');
const uuid = require('uuid');
const uuidv3 = require('uuid/v3');

class Dialogflow {
    
    constructor() {
        this.sessionClient = null;
    }

    start() {

        return new Promise( (resolve, reject) => {
            logger.log("debug", LOG_ID + "start() - enter");

            logger.log("info", LOG_ID + "connect to DialogFlow API");

            try {
                this.sessionClient = new dialogflow.SessionsClient();
                resolve();
            }
            catch(err) {
                logger.log("error", LOG_ID + "Can't connect to Dialogflow", JSON.stringify(err));
                resolve();
            }
        });
    }

    sendMessage(message, conversationId, callback) {
        let that = this;
        logger.log("debug", LOG_ID + "sendMessage() - enter");

        return new Promise(async (resolve, reject) => {
            
            if(this.sessionClient) {
                try {
                logger.log("info", LOG_ID + "sendMessage() - try to send a message to Dialogflow...");

                const sessionPath = this.sessionClient.sessionPath( "api-project-915717824745", uuidv3(conversationId, uuidv3.DNS) )

                const request = {
                    session: sessionPath,
                    queryInput: {
                      text: {
                        // The query to send to the dialogflow agent
                        text: message,
                        // The language used by the client (en-US)
                        languageCode: 'fr',
                      },
                    },
                }

                const response = await that.sessionClient.detectIntent(request);

                const result = response[0].queryResult;

                logger.log("info", LOG_ID + "sendMessage() - text received: " + result.fulfillmentText);

                resolve({
                    "intent": result.intent.displayName,
                    "message": result.fulfillmentText,
                    "action": ""
                });

            } catch(err) {
                logger.log("error", LOG_ID + "Can't send a message " + JSON.stringify(err));
                reject(err);
            }
            
            } else {
                reject(null);
            }
        });
    }
}

module.exports = new Dialogflow();

