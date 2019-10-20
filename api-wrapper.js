// LoR api
const request = require('request');

const baseUrl = "http://";

class LoRAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  deck(player, callback) {
    this._sendRequest("static-decklist", player, callback);
  }

  lastgame(player, callback) {
    this._sendRequest("game-result", player, callback);
  }

  currentgame(player, callback) {
    this._sendRequest("positional-rectangles", player, callback);
  }

  _sendRequest(type, player, callback) {
    const url = `${baseUrl}${player}/${type}/`;
    console.log(url);
    request(url, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        callback(JSON.parse(body));
      }
      else {
      callback(null);
      }
    })
  }
}

module.exports = LoRAPI;
