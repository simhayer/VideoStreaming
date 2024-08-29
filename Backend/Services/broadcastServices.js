const webrtc = require('wrtc');
const {MediaStream} = require('wrtc');
const {v4: uuidv4} = require('uuid');
const config = require('../config');
const {broadcasters} = require('../Data/data');
const socketFunction = require('../Socket/socketFunction');
const stripeService = require('../Services/stripeService');

class Broadcaster {
  constructor(
    _id = null,
    _socket_id,
    _username,
    _profilePicture,
    _title,
    _meetingId,
  ) {
    this.id = _id;
    this.socket_id = _socket_id;
    this.username = _username;
    this.profilePicture = _profilePicture;
    this.title = _title;
    this.meetingId = _meetingId;
    this.watchers = 0;
    this.comments = [];
    this.isBidding = false;
    this.curBidDetails = {};
  }
}

async function addBroadcast(
  socket_id,
  sdp,
  username,
  profilePicture,
  title,
  meetingId,
) {
  console.log('new broadcast');
  //var id = uuidv4();
  var id = socket_id;
  console.log('username: ' + username);
  var broadcast = new Broadcaster(
    id,
    socket_id,
    username,
    profilePicture,
    title,
    meetingId,
  );

  broadcasters[id] = broadcast;

  //broadcastConnectionState(id);
  return id;
}

async function broadcastConnectionState(id) {
  socketFunction.sendListUpdateSignal();
}

async function removeBroadcast(id) {
  if (broadcasters[id] != null) {
    console.log('\x1b[31m', 'remove broadcaster: ' + id, '\x1b[0m');
    delete broadcasters[id];
  }
}

async function addWatcher(id) {
  if (broadcasters[id] != null) {
    console.log('\x1b[31m', 'Updating broadcaster: ' + id, '\x1b[0m');

    if (broadcasters[id].watchers == null) {
      broadcasters[id].watchers = 0;
    }
    broadcasters[id].watchers += 1;

    return broadcasters[id].watchers;
  } else {
    console.log('\x1b[31m', 'Broadcaster not found: ' + id, '\x1b[0m');
    return 0;
  }
}

async function addComment(id, comment, userUsername, userProfilePicture) {
  if (broadcasters[id] != null) {
    console.log('\x1b[31m', 'Updating broadcaster: ' + id, '\x1b[0m');
    broadcasters[id].comments.push({comment, userUsername, userProfilePicture});
  } else {
    console.log('\x1b[31m', 'Broadcaster not found: ' + id, '\x1b[0m');
  }
}

async function addBid(id, bidAmount, userUsername) {
  if (broadcasters[id] != null) {
    console.log('Updating bid for broadcaster: ' + id);
    console.log('bidAmount: ' + bidAmount);
    broadcasters[id].curBidDetails = {
      userUsername,
      bidAmount,
      bidNo: broadcasters[id].curBidDetails.bidNo + 1,
    };
    return broadcasters[id].curBidDetails;
  } else {
    console.log('\x1b[31m', 'Broadcaster not found: ' + id, '\x1b[0m');
  }
}

async function startBid(id) {
  console.log('broadcasters: ' + broadcasters);
  if (broadcasters[id] != null) {
    console.log('Starting bid for broadcaster: ' + id);

    var ret = broadcasters[id].curBidDetails;

    broadcasters[id].curBidDetails = {
      userUsername: 'null',
      bidAmount: 0,
      bidNo: 0,
    };

    return ret;
  } else {
    console.log('\x1b[31m', 'Broadcaster not found: ' + id, '\x1b[0m');
    return 0;
  }
}

async function endBid(id) {
  if (broadcasters[id] != null) {
    console.log('Ending bid for broadcaster: ' + id);
    console.log('ret: ' + broadcasters[id].curBidDetails.bidAmount);
    ret = broadcasters[id].curBidDetails;
    broadcasters[id].isBidding = false;
    broadcasters[id].curBidDetails = {};

    stripeService.chargeCustomerOffSession({
      id,
      amount: ret.bidAmount,
      userUsername: ret.userUsername,
      broadcasterUsername: broadcasters[id].username,
    });
    //todo: send the winner to the client
    return ret;
  } else {
    console.log('\x1b[31m', 'Broadcaster not found: ' + id, '\x1b[0m');
    return {userUsername: 'null', bidAmount: 0, bidNo: 0};
  }
}

function fetch() {
  var data = [];
  for (var bs in broadcasters) {
    if (broadcasters.hasOwnProperty(bs)) {
      data.push({
        id: bs,
        username: broadcasters[bs].username,
        profilePicture: broadcasters[bs].profilePicture,
        title: broadcasters[bs].title,
        meetingId: broadcasters[bs].meetingId,
        socketID: broadcasters[bs].socket_id,
        watchers: broadcasters[bs].watchers,
        comments: broadcasters[bs].comments,
        isBidding: broadcasters[bs].isBidding,
        curBidDetails: broadcasters[bs].curBidDetails,
      });
    }
  }
  return data;
}

module.exports = {
  addBroadcast,
  fetch,
  addWatcher,
  addComment,
  addBid,
  startBid,
  endBid,
  removeBroadcast,
};
