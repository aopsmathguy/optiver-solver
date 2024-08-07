import { SocketConfig } from "./socketUtility.js"
const gamePropertiesSchema = {
    "figureParams" : [
        {
            property : 'string',
            values :  ['string']
        }
    ],
    "rounds" : "uint8",
    "roundTime" : "uint8",
    "scoreParams" : {
        /*
        if g is the number of guesses taken until the correct solution is found,
         and t is the number of seconds remaining when the correct solution is found,
         the score is calculated as follows:
        score = 1000 * (1 - (min(g, guessMax) - 1)/ (guessMax)) + timeScore * t/roundTime
        otherwise, if the correct solution is not found, the score is 0
        */
        "guessMax" : "uint8",//default 12
        "timeScore" : "uint16" //default 150
    }
}
const gameInfoSchema = {
    "code" : "string",
    "players" : [
        {
            "id" : 'uint16',
            "name" : 'string',
            "score" : "float32",
            "totalScore" : "float32"
        }
    ],
    "roundInfo" : {
        "currRound" : "uint8",
        "timeEnd" : "float64",
        "finished" : "boolean",
    },
    "gameProperties" : gamePropertiesSchema,
    "host_id" : "uint16"
}
export const CONFIG = new SocketConfig({
    packetSchemas : {
        //client to server events
        "join" : {
            "id" : "uint16",
            "name" : "string"
        },
        "getGameList" : {},
        "newGame" : {},
        "joinGame" : {
            "code" : "string"
        },
        "setGameProperties" : gamePropertiesSchema,
        "startRound" : {},
        "guess" : {
            "guess" : ["uint8"]
        },


        //server to client events
        "joinResponse" : {
            "id" : "uint16",
            "name" : "string",
            "game" : gameInfoSchema
        },
        "gameList" : {
            "games" : [
                gameInfoSchema
            ]
        },
        "joinGameResponse" : {
            "success" : "boolean",
            "game" : gameInfoSchema
        },
        "gamePropertiesUpdate" : gamePropertiesSchema,
        "playerJoinLeave" : {
            "id" : 'uint16',
            "name" : 'string',
            "join" : "boolean"
        },
        "roundStart" : {
            "round" : "uint8",
            "timeEnd" : "float64"
        },
        "roundEnd" : {
            "round" : "uint8",
            "solution" : ["uint8"],
            "players" : [
                {
                    "id" : 'uint16',
                    "name" : 'string',
                    "score" : "float32",
                    "totalScore" : "float32"
                }
            ],
        },
        "gameOver" : {
            "players" : [
                {
                    "id" : 'uint16',
                    "name" : 'string',
                    "totalScore" : "float32"
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