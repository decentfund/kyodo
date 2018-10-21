const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const sdk = require('matrix-js-sdk');
const BigNumber = require('bignumber.js');
const dayjs = require('dayjs');
const axios = require('axios');
const {
  domains,
  max_points,
  sheet_id,
  sheet_tab_name,
} = require('./constants');
const { initDb } = require('@kyodo/backend/db');

// If modifying these scopes, delete credentials.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "credentials.json";
const { getUserBalance, updateUserAddress } = require("@kyodo/backend/user");
const { sendNewTip } = require("@kyodo/backend/tip");
const { getPointTypes } = require("@kyodo/backend/domain");

// Load client secrets from a local file.
fs.readFile('client_secret.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Sheets API.
  authorize(JSON.parse(content), authenticated);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0],
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', code => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return callback(err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const client = sdk.createClient('https://matrix.decent.fund');

function authenticated(auth) {
  client.login(
    'm.login.password',
    {
      user: process.env.BOT_USER,
      password: process.env.BOT_PASSWORD,
    },
    (err, data) => {
      if (err) {
        console.log('Error:', err);
      }

      console.log(`Logged in ${data.user_id} on device ${data.device_id}`);
      const client = sdk.createClient({
        baseUrl: 'https://matrix.decent.fund',
        accessToken: data.access_token,
        userId: data.user_id,
        deviceId: data.device_id,
      });

      // Connecting to db
      initDb();

      client.on('Room.timeline', (event, room, toStartOfTimeline) => {
        if (
          event.getType() === 'm.room.message' &&
          toStartOfTimeline === false
        ) {
          client.setPresence('online');
          const message = event.getContent().body;
          const roomId = room.roomId;
          const command = message.toLowerCase().split(' ')[0];
          if (command == '!help') {
            client.sendTextMessage(
              roomId,
              'dish points using the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]',
            );
          } else if (command == '!dish') {
            handleDish(event, room, client, auth);
          } else if (command == '!create') {
            handleTask(event, room, client, auth);
          } else if (command == '!balance') {
            handleBalance(event, room, client, auth);
          } else if (command == '!address') {
            handleAddress(event, room, client, auth);
          } else if (command == '!sheet') {
            client.sendTextMessage(
              roomId,
              `the rewardDAO sheet can be found here: https://docs.google.com/spreadsheets/d/${sheet_id}`,
            );
          }
        }
      });

      client.once('sync', syncState => {
        if (syncState === 'PREPARED') {
          client.on('RoomState.newMember', (event, state, member) => {
            const SC_ROOM_ID = '!kUeYRcrXObgGoJlFjn:matrix.org';
            if (state.roomId == SC_ROOM_ID) {
              handle_social_coding_welcome(event, state, member, client);
            }
          });
        }
      });
      client.startClient(0);
    },
  );
}

function handle_social_coding_welcome(event, state, member, client) {
  const user = member.userId;
  client.sendTextMessage(
    state.roomId,
    `Wecome ${user} to #giveth-social-coding:matrix.org where your pragma can roam the wild steppe of the blockchain world`,
  );
  client
    .createRoom({
      preset: 'trusted_private_chat',
      invite: [user],
      is_direct: true,
    })
    .then(res => {
      client.sendTextMessage(
        res.room_id,
        'Now that you’re in [Social Coding] there are a few resources that will help you along the way:\
     [What are points](https://medium.com/giveth/how-rewarddao-works-aka-what-are-points-7388f70269a) and [What is Social Coding](https://steemit.com/blockchain4humanity/@giveth/what-is-the-social-coding-circle).\
    if you have any questions that are not covered in the literature please reach out to @Quazia or @YalorMewn and they will happily follow up with you in 24-48 hours',
      );
    });
}

function handleTask(event, room, client, auth) {
  const sender = event.getSender();
  const message = event.getContent().body;

  try {
    // Fetching point types
    let point_types;
    getPointTypes().then(data => {
      point_types = data;
    });

    const splitMsg = message.toLowerCase().split(" ");
    const type = splitMsg[1].toUpperCase();
    if (!point_types.includes(type)) {
      const typeError = new Error(
        `Invalid domain type '${type}'. Please use one of ${point_types}.`,
      );
      typeError.code = 'POINT_TYPE_DOES_NOT_EXIST';
      throw typeError;
    }

    const hasTask = splitMsg[2] === 'task';
    if (!hasTask) {
      const typeError = new Error(
        'You\'re missing "task", please use the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]"',
      );
      typeError.code = 'MISSING_POINTS_TO';
      throw typeError;
    }

    // let { userInRoom, receiver, display_name, multipleUsers } = findReceiver(
    // room,
    // message.split(' ')[5],
    // ); // try to find user

    // handle github users
    // const BASE_GITHUB_URL = 'https://github.com/';
    // if (splitMsg[5].split(BASE_GITHUB_URL)[1]) {
    // receiver = splitMsg[5];
    // (userInRoom = true), (multipleUsers = false);
    // }

    // if (multipleUsers) {
    // const userError = new Error(`There are multiple users with the name '${receiver}' in this room.
    // please specify the domain name of the user using the format @[userId]:[domain]`);
    // userError.code = 'USER_MULTIPLE';
    // throw userError;
    // }

    // if (!userInRoom) {
    // const userError = new Error(`Username '${receiver}' does not exist in this room.
    // either add this user to the room, or try again using the format @[userId]:[domain]`);
    // userError.code = 'USER_DOES_NOT_EXIST';
    // throw userError;
    // }

    const taskTitle = message.split('task')[1];
    // const date = dayjs().format('DD-MMM-YYYY');
    // const link = `https://riot.im/app/#/room/${room.roomId}/${event.getId()}`;

    // const values = [
    // [
    // receiver,
    // sender,
    // reason,
    // amount.toFormat(2),
    // type,
    // date,
    // link,
    // display_name,
    // ],
    // ];

    // const body = { values };
    // TODO: Write to DB instead of spreadsheets
    // TODO: Create task
    console.log('should send');
    axios
      .post('http://localhost:3666/task', {
        taskTitle,
        dueDate: '2018-12-12',
      })
      .then(function(response) {
        const data = response.data;
        console.log(data);
        client.sendTextMessage(
          room.roomId,
          'Created new task: ' +
            data.taskTitile +
            ' with id: ' +
            data.taskId +
            "\nType '!help' for more information.",
        );
      })
      .catch(function(error) {
        console.log(error);
      });
  } catch (err) {
    const MANUAL_ERROR_CODES = [
      'POINTS_NOT_NUMBER',
      'USER_DOES_NOT_EXIST',
      'POINT_TYPE_DOES_NOT_EXIST',
      'MISSING_POINTS_TO',
      'USER_MULTIPLE',
      'POINTS_ARE_NEGATIVE_OR_ZERO',
      'POINTS_OVER_MAXIMUM',
    ];
    console.log(err);
    if (MANUAL_ERROR_CODES.includes(err.code)) {
      client.sendTextMessage(
        room.roomId,
        'ERROR: ' + err.message + "\nType '!help' for more information.",
      );
    } else {
      client.sendTextMessage(
        room.roomId,
        'ERROR, please use the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]',
      );
    }
  }
}

const isDirectChat = (room, user) => {
  let type = 'room';
  // if (type === 'directMessage') {
  // state.sources[roomId].name = room.name.replace(/@(\w+):.+/, '$1');
  // }
  const allMembers = room.currentState.getMembers();
  if (
    type === 'room' &&
    allMembers.length <= 2 &&
    allMembers.some(m => m.userId === user)
  ) {
    // if (
    // // allMembers.some(m => m.getDMInviter()) &&
    // ) {
    type = 'directMessage';
    // }
  }

  return type === 'directMessage';
};

const cutUserAlias = sender => sender.slice(1).split(':')[0];

const getOrCreatePrivateRoom = async (client, event, alias = null) => {
  const party = alias || event.getSender();

  let userRoom = client.getRooms().find(r => isDirectChat(r, party));
  let roomId;
  if (userRoom) roomId = userRoom.roomId;
  if (!userRoom) {
    const newChat = await client.createRoom({
      preset: "trusted_private_chat",
      invite: [party],
      is_direct: true
    });
    roomId = newChat.room_id;
  }

  return roomId;
};

async function handleBalance(event, room, client, auth) {
  const sender = event.getSender();
  const message = event.getContent().body;

  const roomId = await getOrCreatePrivateRoom(client, event);
  try {
    const balance = await getUserBalance(cutUserAlias(sender));
    client.sendTextMessage(roomId, `Your current points balance is ${balance}`);
  } catch (e) {
    client.sendTextMessage(
      roomId,
      'You are not registered! If you are whitelisted head over to http://kyodo.decent.fund to set your alias',
    );
  }
}

async function handleAddress(event, room, client, auth) {
  const sender = event.getSender();
  const message = event.getContent().body;
  const roomId = await getOrCreatePrivateRoom(client, event);

  try {
    const splitMsg = message.toLowerCase().split(' ');
    const address = splitMsg[1];
    const user = await updateUserAddress({
      alias: cutUserAlias(sender),
      address,
    });
    client.sendTextMessage(
      roomId,
      `I have successfully updated your address to ${user.address}`,
    );
  } catch (e) {
    client.sendTextMessage(roomId, e.message);
  }
}

const titleRegex = /for\s(.+)/;
const parseTitle = message => message.toLowerCase().split(titleRegex)[1];
module.exports = {
  parseTitle
};

async function handleDish(event, room, client, auth) {
  const sender = event.getSender();
  const message = event.getContent().body;

  try {
    const splitMsg = message.toLowerCase().split(' ');
    const amount = new BigNumber(splitMsg[1]);

    if (amount.isNaN()) {
      const pointError = new Error(
        'Invalid number of points dished. Please enter a valid number and try again',
      );
      pointError.code = 'POINTS_NOT_NUMBER';
      throw pointError;
    }

    if (amount.isLessThan(1)) {
      const pointError = new Error(
        "You can't dish negative or zero amount of points!",
      );
      pointError.code = 'POINTS_ARE_NEGATIVE_OR_ZERO';
      throw pointError;
    }

    if (amount.isGreaterThan(max_points)) {
      const pointError = new Error(
        `You can't dish more than ${max_points} points each time!`,
      );
      pointError.code = 'POINTS_OVER_MAXIMUM';
      throw pointError;
    }

    const type = splitMsg[2].toUpperCase();

    // Fetching point types
    let point_types;
    await getPointTypes().then(data => {
      point_types = data;
    });
    if (!point_types.includes(type)) {
      const typeError = new Error(
        `Invalid point type '${type}'. Please use one of ${point_types}.`,
      );
      typeError.code = 'POINT_TYPE_DOES_NOT_EXIST';
      throw typeError;
    }

    const hasPointsTo = splitMsg[3] === 'points' && splitMsg[4] === 'to';
    if (!hasPointsTo) {
      const typeError = new Error(
        'You\'re missing "points to", please use the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]"',
      );
      typeError.code = 'MISSING_POINTS_TO';
      throw typeError;
    }

    let { userInRoom, receiver, display_name, multipleUsers } = findReceiver(
      room,
      message.split(' ')[5],
    ); // try to find user

    // handle github users
    const BASE_GITHUB_URL = 'https://github.com/';
    if (splitMsg[5].split(BASE_GITHUB_URL)[1]) {
      receiver = splitMsg[5];
      (userInRoom = true), (multipleUsers = false);
    }

    if (receiver === sender) {
      const userError = new Error('You cannot dish points to yourself');
      userError.code = 'USER_SAME';
      throw userError;
    }

    if (multipleUsers) {
      const userError = new Error(`There are multiple users with the name '${receiver}' in this room.
please specify the domain name of the user using the format @[userId]:[domain]`);
      userError.code = 'USER_MULTIPLE';
      throw userError;
    }

    if (!userInRoom) {
      const userError = new Error(`Username '${receiver}' does not exist in this room.
either add this user to the room, or try again using the format @[userId]:[domain]`);
      userError.code = 'USER_DOES_NOT_EXIST';
      throw userError;
    }

    const title = parseTitle(message);
    // const reason = 'For' + message.toLowerCase().split('for')[1];
    const date = dayjs().format('DD-MMM-YYYY');
    const link = `https://riot.im/app/#/room/${room.roomId}/${event.getId()}`;

    // const values = [
    // [
    // receiver,
    // sender,
    // reason,
    // amount.toFormat(2),
    // type,
    // date,
    // link,
    // display_name,
    // ],
    // ];
    // const body = { values };
    // TODO: Write to DB instead of spreadsheets
    // TODO: Create task
    try {
      const tip = await sendNewTip({
        sender: cutUserAlias(sender),
        receiver: cutUserAlias(receiver),
        amount,
        domain: type,
        title
      });

      if (tip.to.address === undefined) {
        const roomId = await getOrCreatePrivateRoom(client, event, receiver);
        const message =
          "You've been tipped, but we don't know your address. Please carefully provide it here using following syntax: `!address <your address>`";

        client.sendTextMessage(roomId, message);
      }

      client.sendTextMessage(
        room.roomId,
        `${sender} dished ${amount} ${type} points to ${receiver}`
      );
    } catch (e) {
      const roomId = await getOrCreatePrivateRoom(client, event);
      client.sendTextMessage(roomId, e.message);
    }
  } catch (err) {
    const MANUAL_ERROR_CODES = [
      'POINTS_NOT_NUMBER',
      'USER_DOES_NOT_EXIST',
      'USER_SAME',
      'POINT_TYPE_DOES_NOT_EXIST',
      'MISSING_POINTS_TO',
      'USER_MULTIPLE',
      'POINTS_ARE_NEGATIVE_OR_ZERO',
      'POINTS_OVER_MAXIMUM',
    ];
    console.log(err);
    if (MANUAL_ERROR_CODES.includes(err.code)) {
      client.sendTextMessage(
        room.roomId,
        'ERROR: ' + err.message + "\nType '!help' for more information.",
      );
    } else {
      client.sendTextMessage(
        room.roomId,
        'ERROR, please use the following format:\n!dish [#of points] [type of points] points to [handle] for [reason]',
      );
    }
  }
}

// Try to intelligently format the receiver field
function findReceiver(room, receiver) {
  if (receiver[0] != '@') {
    receiver = `@${receiver}`;
  }

  //defaults
  let userInRoom = false;
  let multipleUsers = false;
  let display_name = '';

  if (room.getMember(receiver) != null) {
    userInRoom = true;
  }

  if (receiver.split(':').length < 2 && !userInRoom) {
    for (let domain of domains) {
      if (room.getMember(`${receiver}:${domain}`) != null) {
        receiver = `${receiver}:${domain}`;
        display_name = room.getMember(receiver).name;

        // if a user has already been found under a different domain
        if (userInRoom) {
          multipleUsers = true;
          receiver = receiver.split(':')[0];
          break;
        }

        // user under this domain was found.
        userInRoom = true;
      }
    }
  }
  return {
    userInRoom,
    receiver,
    multipleUsers,
    display_name,
  };
}

// Zeit NOW workaround
const http = require('http');
http
  .createServer((req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Hello there!');
  })
  .listen();
