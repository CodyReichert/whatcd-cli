#!/usr/bin/env node

// imports
var settings = require('./settings');
var https    = require('https');
var fs       = require('fs');
var chalk    = require('chalk');
var WhatCD   = require('whatcd');

// prompt settings
var prompt = require('prompt');
prompt.message = '';
prompt.delimiter = '';
prompt.start();

// chalk colors for output
var green = chalk.green();
var red = chalk.red()
var yellow = chalk.yellow();

// what.cd client
var whatUrl = 'https://what.cd';
var client =  new WhatCD(whatUrl, settings.username, settings.password);
var authkey;
var passkey;
login(settings.username, settings.password);

// login
function login(username, password) {
  client.index(function(err, data) {
    if (err) {
      return onErr(err);
    }
    authkey = data.authkey;
    passkey = data.passkey;
    console.log(chalk.green('\n Welcome back, ' + username + '!'));
    typeOfSearch();
  });
}

// Main menu
function typeOfSearch() {
  console.log(chalk.blue('___________________________________________________________________________________'));
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

  // Browse Torrents
  if (searchType === 'B' || searchType === 'b') {
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
        for (var i = 0; i < data.results.length; i++) {
          if (data.results[i].artist !== 'Various Artists') {
            console.log(chalk.bold(data.results[i].artist + ': ' + data.results[i].groupName + ' ' +
                        chalk.red(data.results[i].groupYear) + chalk.cyan(' ['+data.results[i].releaseType+']')));
            var torrents = data.results[i].torrents;
            if (torrents == undefined) {
              console.log('');
            } else {
              for (var t = 0; t < torrents.length; t++) {
                console.log('  - ' + torrents[t].format + ' ' + torrents[t].encoding +
                            ' (' + chalk.green(torrents[t].seeders) + '/' + chalk.red(torrents[t].leechers) + ')' +
                            ' Torrent Id: ' + torrents[t].torrentId);
              }
            }
          }
        }
        typeOfSearch();
      });
    });
  }

  // View top 10 torrents of the day
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

  // Download torrent file
  else if (searchType === 'Download' || searchType ===  'D' || searchType ===  'd') {

    prompt.get(['Id'], function(err, result) {
      if (err) {
        return onErr(err);
      }
      var torrentId;
      var torrentSize;
      var torrentFormat;
      var torrentFilepath;
      // get album info
      client.api_request({ action: 'torrent', id: result.Id}, function(err, data) {
        if (err) {
          return onErr(err);
        }
        torrentId = data.torrent.id;
        torrentSize = data.torrent.size;
        torrentFilepath = data.torrent.filePath;
        torrentFormat = data.torrent.format;
        var url = 'https://ssl.what.cd/torrents.php?action=download&id=' + result.Id + '&authkey=' + authkey + '&torrent_pass=' + passkey
        var request = https.get(url, function(res) {
          console.log(torrentFilepath);
          var data = '';
          res.setEncoding('binary');
          res.on('data', function(chunk) {
            data += chunk;
          });
          res.on('end', function() {
            //var fileName = torrentInfo.torrentFilePath + '.torrent';
            var fileName = settings.torrentDirectory + torrentFilepath + '.torrent';
            fs.writeFile(fileName, data, 'binary', function(err) {
              if (err) { onErr(err) }
              console.log('File saved!');
              typeOfSearch();
            });
          });
          res.on('error', function(err) { console.log(err.stack) });
        });
      });
    });
  }

  // Throw errors for unsupported features
  else {
    var error = chalk.yellow('Sorry, that search is not yet supported. Please back check for an udpate');
    return onErr(error);
  }
}

function onErr(err) {
  console.log(err);
  typeOfSearch();
}
