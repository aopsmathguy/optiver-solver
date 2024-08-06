import { SocketConfig } from "./socketUtility.js"
export const CONFIG = new SocketConfig({
    packetSchemas : {
        //client to server events
        "guess" : {
            "guess" : ["uint8"]
        },
        //server to client events
        "properties" : {
            "properties" : [
                {
                    property : 'string',
                    values :  ['string']
                }
            ]
        },
        "guessResult" : {
            "similarity" : "uint8",
            "guess" : ["uint8"]
        },
        "nextGuess" : {
            "guess" : ["uint8"],
            "bits" : "float32"
        }
    },
    heartBeatInterval : 10000,
    keepAliveTimeout : 20000
});