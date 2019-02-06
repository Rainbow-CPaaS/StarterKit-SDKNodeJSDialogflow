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

        return new Promise((resolve, reject) => {
            logger.log("debug", LOG_ID + "start() - enter");

            logger.log("info", LOG_ID + "connect to DialogFlow API");

            try {
                this.sessionClient = new dialogflow.SessionsClient();
                resolve();
            } catch (err) {
                logger.log("error", LOG_ID + "Can't connect to Dialogflow", JSON.stringify(err));
                resolve();
            }
        });
    }

    sendMessage(message, conversationId, language) {
        let that = this;
        logger.log("debug", LOG_ID + "sendMessage() - enter");

        return new Promise(async (resolve, reject) => {

            if (this.sessionClient) {
                try {
                    logger.log("info", LOG_ID + "sendMessage() - try to send a message to Dialogflow...");

                    const sessionPath = this.sessionClient.sessionPath(await this.sessionClient.getProjectId(), uuidv3(conversationId, uuidv3.DNS))

                    const request = {
                        session: sessionPath,
                        queryInput: {
                            text: {
                                text: message,
                                languageCode: language,
                            }
                        },
                    }

                    const response = await that.sessionClient.detectIntent(request);

                    const result = response[0].queryResult;

                    // retrieve markdown content if available
                    let entry = result.fulfillmentMessages.find(item => ["payload"].includes(item.message));
                    let content = (entry &&
                         entry.payload &&
                          entry.payload.fields &&
                          entry.payload.fields.rainbow &&
                          entry.payload.fields.rainbow.structValue &&
                          entry.payload.fields.rainbow.structValue.fields &&
                          entry.payload.fields.rainbow.structValue.fields.text ) ? entry.payload.fields.rainbow.structValue.fields.text.stringValue : null;

                    logger.log("info", LOG_ID + "sendMessage() - text received: " + result.fulfillmentText);

                    resolve({
                        "intent": result.intent.displayName,
                        "message": result.fulfillmentText,
                        "content": { "message": content },
                        "action": ""
                    });

                } catch (err) {
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