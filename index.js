/**
 * Firebase Cloud Messaging (FCM) can be used to send messages to clients on iOS, Android and Web.
 *
 * This sample uses FCM to send two types of messages to clients that are subscribed to the `news`
 * topic. One type of message is a simple notification message (display message). The other is
 * a notification message (display notification) with platform specific customizations. For example,
 * a badge is added to messages that are sent to iOS devices.
 */
const https = require('https');
const express = require('express');
const cors = require('cors');
const dayjs = require('dayjs');
const { v4 } = require('uuid');

const { google } = require('googleapis');
const app = express();
app.use(cors({credentials: true, origin: true}));
app.use(express.json());

const CLIENT_ID=
    //"e3t8w5mwvPjdcLZWMmxqgu:APA91bHuXx4H4O0GZzpIQV-HYyzCP6xsLs6OhaltZGLCJQfKQ_k16E27CZhbPZvKhNcXdybphQz-QJ8hvX83LF-5i2Qa54qGVz2igwnOOjlODJoKO6gR3e83ajkt9WOI5yS73tVhKP7t"
    "cL8bKQ6HRyuoNO2gAESaUl:APA91bE9LEa2y2SFnu_lOT5DLFuUkGX3vNBn96Nn37mHhOblSn1JLDcxoAz7Bg8_GLU6r2Ivf-yuZK77394I7rvJVdSOGlnptsfh2n1D8I5IW4NCM7bzWbxToTogR5OzT7Flx28XV6pQ"
;
//test
//const PROJECT_ID = 'testwebpush-37319';
const PROJECT_ID = 'rol-app-51596';
const HOST = 'fcm.googleapis.com';
const PATH = '/v1/projects/' + PROJECT_ID + '/messages:send';
const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
const SCOPES = [MESSAGING_SCOPE];

/**
 * Get a valid access token.
 */
// [START retrieve_access_token]
function getAccessToken() {
    return new Promise(function(resolve, reject) {
        const key = require('./rol_service.json');
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            SCOPES,
            null
        );
        jwtClient.authorize(function(err, tokens) {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}
// [END retrieve_access_token]

/**
 * Send HTTP request to FCM with given message.
 *
 * @param {object} fcmMessage will make up the body of the request.
 */
function sendFcmMessage(fcmMessage) {
    getAccessToken().then(function(accessToken) {
        const options = {
            hostname: HOST,
            path: PATH,
            method: 'POST',
            // [START use_access_token]
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
            // [END use_access_token]
        };

        const request = https.request(options, function(resp) {
            resp.setEncoding('utf8');
            resp.on('data', function(data) {
                console.log('Message sent to Firebase for delivery, response:');
                console.log(data);
            });
        });

        request.on('error', function(err) {
            console.log('Unable to send message to Firebase');
            console.log(err);
        });

        request.write(JSON.stringify(fcmMessage));
        request.end();
    });
}

/**
 * Construct a JSON object that will be used to customize
 * the messages sent to iOS and Android devices.
 */
function buildOverrideMessage() {
    const fcmMessage = buildCommonMessage();
    const apnsOverride = {
        'payload': {
            'aps': {
                'badge': 1
            }
        },
        'headers': {
            'apns-priority': '10'
        }
    };

    const androidOverride = {
        'notification': {
            'click_action': 'android.intent.action.MAIN'
        }
    };

    fcmMessage['message']['android'] = androidOverride;
    fcmMessage['message']['apns'] = apnsOverride;

    return fcmMessage;
}

/**
 * Construct a JSON object that will be used to define the
 * common parts of a notification message that will be sent
 * to any app instance subscribed to the news topic.
 */
function buildCommonMessage() {
    return {
        "message": {
            "token": CLIENT_ID,
            "data": {
              "type": "CLAIM_UPDATE"
            },
            "notification": {
                "title": "ROL 1 - Message chat",
                "body": "You have received a new message in the chat of ROL 1"
            },
            "webpush": {
                "fcm_options": {
                    "link": "#/rol-open/1"
                }
            }
        }
    }
        // 'message': {
        //     'topic': 'news',
        //     'notification': {
        //         'title': 'FCM Notification',
        //         'body': 'Notification from FCM'
        //     }
        // }
}

// const message = process.argv[2];
// if (message && message == 'common-message') {
//     const commonMessage = buildCommonMessage();
//     console.log('FCM request body for message using common notification object:');
//     console.log(JSON.stringify(commonMessage, null, 2));
//     sendFcmMessage(buildCommonMessage());
//     //setTimeout(() => {sendFcmMessage(buildCommonMessage());}, 10000);
//
// } else if (message && message == 'override-message') {
//     const overrideMessage = buildOverrideMessage();
//     console.log('FCM request body for override message:');
//     console.log(JSON.stringify(overrideMessage, null, 2));
//     sendFcmMessage(buildOverrideMessage());
// } else {
//     console.log('Invalid command. Please use one of the following:\n'
//         + 'node index.js common-message\n'
//         + 'node index.js override-message');
// }

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.post("/api/chats/messages", (req, res, next) => {
    const message = req.body.message;
    
    res.json({
        "id":v4(),
        "from":"TSROLD01",
        "message":message,
        "date": dayjs().format("YYYY-MM-DD HH:mm:ss"), //"2024-05-16 15:36:27",
        "attachments":[]
    });
});