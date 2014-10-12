#!/usr/bin/env node

// imports
var settings = require('./settings');
var https = require('https');
var fs = require('fs');
var chalk = require('chalk');
var WhatCD = require('whatcd');

// prompt settings
var prompt = require('prompt');
prompt.message = '';
prompt.delimiter = '';
prompt.start();

// globals
var whatUrl = 'https://what.cd';
// chalk colors for output
var green = chalk.green();
var red = chalk.red()
var yellow = chalk.yellow();

var client =  new WhatCD(whatUrl, settings.username, settings.password);
var authkey;
var passkey;
login(settings.username, settings.password);

function login(username, password) {
  client.index(function(err, data) {
    if (err) {
      return onErr(err);
    }
    authkey = data.authkey;
    passkey = data.passkey;
    console.log(data.authkey);
    console.log(chalk.green('\n Welcome back, ' + username + '!'));
    typeOfSearch();
  });
}

function typeOfSearch() {
  console.log(chalk.blue('_________________________________________________________________________________'));
  console.log('(A)rtist Search, (B)rowse, (T)orrent Search, (Top) 10, (S)imilar Artist, (D)ownload');
  prompt.get(['selection'], function(err, result) {
    if (err) {
      return onErr(err);
    }
    var searchType = result.selection;
    whatSearch(searchType);
  });
}

function whatSearch(searchType) {

  if (searchType === 'B') {
    prompt.get(['Search'], function(err, result) {
      if (err) {
        return onErr(err);
      }
      var query = result.Search;
      client.api_request({ action: "browse", searchstr: query }, function(err, data) {
        if (err) {
          console.log(err);
          return onErr(err);
        }
        if (data.results.length === '0') {
          console.log('Sorry, no results found');
        }
        for (var i = 0; i < data.results.length; i++) {
          if (data.results[i].artist === query) {
            console.log(data.results[i].artist + ': ' + data.results[i].groupName +
                        ' (Id: ' + chalk.cyan(data.results[i].groupId) + ') \n Torrents:');
            var torrents = data.results[i].torrents;
            for (var t = 0; t < torrents.length; t++) {
              console.log('  - ' + torrents[t].format + ' ' + torrents[t].encoding +
                          ' (' + chalk.green(torrents[t].seeders) + '/' + chalk.red(torrents[t].leechers) + ')' +
                          ' Torrent Id: ' + torrents[t].torrentId);
            }
          }
        }
        typeOfSearch();
      });
    });
  }
  else if (searchType === 'Top') {
    client.api_request({ action: "top10" }, function(err, data) {
      if (err) {
        console.log(err);
        return onErr(err);
      }
      console.log('** ' + data[0].caption + ' **');
      var result = data[0].results
      var j = 1
      for (var i = 0; i < data[0].results.length; i ++) {
        console.log(chalk.yellow([j] + ') ') + result[i].artist + ': ' + result[i].groupName +
                    chalk.yellow(' [' + result[i].format + ']'));
        j = j + 1;
      }
      typeOfSearch();
    });
  }
  else if (searchType === 'Download') {

    var url = 'https://ssl.what.cd/torrents.php?action=download&id=30742004&authkey=f6e480cfed7b10c1cc28db018fd52650&torrent_pass=ks0yxzotdlxpmkx2e7yx877q6xzwa1uh'
    var request = https.get(url, function(res) {
      var data = '';
      res.setEncoding('binary');
      res.on('data', function(chunk) {
        data += chunk;
      });
      res.on('end', function() {
        console.log(data);
        fs.writeFile('torrent.torrent', data, 'binary', function(err) {
          if (err) { onErr(err) }
          console.log('File saved!');
          typeOfSearch();
        });
      });
      res.on('error', function(err) { console.log(err.stack) });
    })


    //client.api_request({ action: "download", id: 29549210 }, function(err, data) {
    //  if (err) {
    //    console.log(err);
    //    return onErr(err);
    //  }
    //  typeOfSearch();
    //});
  }
  else if (searchType === 'D') {
    prompt.get(['Id'], function(err, result) {
      if (err) {
        return onErr(err);
      }
      var torrentId = result.Id;
      client.api_request({ action: "torrent", id: torrentId }, function(err, data) {
        if (err) {
          console.log(err);
          return onErr(err);
        }
        console.log(data);
        //for (var i = 0; i < data.results.length; i++) {
        //  console.log(data.results[i].artist + ': ' + data.results[i].groupName +
        //              ' (Id: ' + chalk.cyan(data.results[i].groupId) + ')');
        //}
        typeOfSearch();
      });
    });
  }
  else {
    var error = chalk.yellow('Sorry, that search is not yet supported. Please check for an udpate');
    return onErr(error);
  }

}

function onErr(err) {
  console.log(err);
  typeOfSearch();
}
