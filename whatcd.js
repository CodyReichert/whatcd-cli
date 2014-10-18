var _ = require("underscore"),
    querystring = require("querystring"),
    request = require("request");

var WhatCD = module.exports = function WhatCD(base_url, username, password) {
  if (!(this instanceof WhatCD)) {
    return new WhatCD(base_url, username, password);
  }

  this.base_url = base_url;
  this.username = username;
  this.password = password;

  this._request = request.defaults({jar: request.jar()})

  this.logged_in = false;
};

WhatCD.prototype.login = function login(cb) {
  this._request.post({uri: this.base_url + "/login.php", form: {username: this.username, password: this.password}}, function(err, res, data) {
    if (err) {
      return cb(err);
    }

    if (res.statusCode !== 302) {
      return cb(Error("couldn't log in, status code was " + res.statusCode));
    }

    this.logged_in = true;

    return cb();
  }.bind(this));
};

WhatCD.prototype.api_request = function request(parameters, cb) {
  if (typeof parameters === "function") {
    cb = parameters;
    parameters = {};
  }

  if (!this.logged_in) {
    return this.login(function(err) {
      if (err) {
        return cb(err);
      } else {
        return this.api_request(parameters, cb);
      }
    }.bind(this));
  }

  this._request.get(this.base_url + "/ajax.php?" + querystring.stringify(parameters), function(err, res, data) {
    if (err) {
      return cb(err);
    }

    if (res.statusCode !== 200) {
      return cb(Error("invalid status code: " + res.statusCode));
    }

    try { data = JSON.parse(data); } catch (e) { return cb(e); }

    if (data.status !== "success") {
      return cb(Error("invalid status message: " + data.status));
    }

    //if (parameters.action == "similar_artists") {
    //  return cb(null, data);
    //}

    return cb(null, data.response);
  });
};

[
  "index",
  "user",
  "inbox",
  "inbox/inbox",
  "inbox/sentbox",
  "inbox/viewconv",
  "top10",
  "top10/torrents",
  "top10/tags",
  "top10/users",
  "usersearch",
  "requests",
  "browse",
  "bookmarks",
  "bookmarks/torrents",
  "bookmarks/artists",
  "subscriptions",
  "forum/main",
  "forum/viewforum",
  "forum/viewthread",
  "artist",
  "torrent",
  "torrentgroup",
  "request",
  "notifications",
  "similar_artists",
  "announcements",
].forEach(function(spec) {
  spec = spec.split("/");

  var snakeCase = spec.join("_");
  var camelCase = spec[0] + spec.slice(1).map(function(e) {
    return e.replace(/^([a-z])/, function(e) {
      return e.toUpperCase();
    });
  });

  WhatCD.prototype[snakeCase] = WhatCD.prototype[camelCase] = function(parameters, cb) {
    if (typeof parameters === "function") {
      cb = parameters;
      parameters = {};
    }

    return this.api_request(_.extend({action: spec[0], type: spec[1]}, parameters), cb);
  };
});
