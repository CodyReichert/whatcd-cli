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

// what.cd client
var whatUrl = 'https://what.cd';
var client =  new WhatCD(whatUrl, settings.username, settings.password);
var authkey;
var passkey;

login(settings.username, settings.password);

//-----------------------------------//
// Authentication. Get sent to the main
// menu upon successful authentication
//-----------------------------------//
function login(username, password) {
  client.index(function(err, data) {
    if (err) {
      return onErr(err);
    }
    authkey = data.authkey;
    passkey = data.passkey;
    console.log(chalk.green.bold('\n Welcome back, ' + username + '!'));
    mainMenu();
  });
}

// Main menu
function mainMenu() {
  console.log(chalk.blue('_________________________________________________________________________________________\n') +
                          chalk.magenta('Search for any artist, album or torrent, or use one of the advanced search' +
                          ' commands below'));
  console.log(chalk.bold('(A)') + 'rtist Search,' +
              chalk.bold('(T)') + 'orrent Search,' +
              chalk.bold('(Top)') + ' 10,' +
              chalk.bold('(S)') + 'imilar Artist,' +
              chalk.bold('(D)') + 'ownload');
  prompt.get(['selection'], function(err, result) {
    if (err) {
      return onErr(err);
    }
    var searchType = result.selection;
    whatSearch(searchType);
  });
}

//------------------------------------------------------------------//
// The input from the main menu comes here, and if no advanced
// search option was chosen the default search browses all torrents
//------------------------------------------------------------------//
function whatSearch(searchType) {

  // Similar Artists
  if (searchType === 's' || searchType === 'S') {
    prompt.get(['Artist'], function(err, result) {
      client.api_request({ action: "artist", artistname: result.Artist }, function(err, data) {
        if (err) {
          console.log(err);
          return onErr(err);
        }
        for (var i = 0; i < 10; i++) {
          if (data.similarArtists[i] == undefined) { return mainMenu(); }
          console.log(chalk.bold(data.similarArtists[i].name) + ' - ' +
                      chalk.yellow(chalk.bold(data.similarArtists[i].score) + ' point match!'));
        }
        mainMenu();
      });
    });
  }

  // Top 10 torrents of the day
  else if (searchType === 'Top' || searchType === 'top') {
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
      mainMenu();
    });
  }

  // Download torrent file by id
  else if (searchType === 'Download' || searchType ===  'D' || searchType ===  'd') {

    console.log(chalk.cyan('Enter the id of the torrent file'));
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
        var url = 'https://ssl.what.cd/torrents.php?action=download&id=' +
                  result.Id +
                  '&authkey=' +
                  authkey +
                  '&torrent_pass=' +
                  passkey
        var request = https.get(url, function(res) {
          console.log(torrentFilepath);
          var data = '';
          res.setEncoding('binary');
          res.on('data', function(chunk) {
            data += chunk;
          });
          res.on('end', function() {
            var fileName = settings.torrentDirectory + torrentFilepath + '.torrent';
            fs.writeFile(fileName, data, 'binary', function(err) {
              if (err) { onErr(err) }
              console.log('File saved!');
              mainMenu();
            });
          });
          // Catch any errors during file write
          res.on('error', function(err) { console.log(err.stack) });
        });
      });
    });
  }

  // Throw errors for unsupported features
  else if (searchType === 'A' || searchType === 'a' || searchType === 'T' || searchType === 't') {
    var error = chalk.yellow('Sorry, that search is not yet supported. Please back check for an udpate');
    return onErr(error);
  }

  // Browse Torrents - DEFAULT ACTION FROM MAIN MENU
  else {
    var query = searchType;
    client.api_request({ action: "browse", searchstr: query }, function(err, data) {
      if (err) {
        console.log(err);
        return onErr(err);
      }
      for (var i = 0; i < data.results.length; i++) {
        if (data.results[i].artist && data.results[i].artist !== 'Various Artists') {
          console.log(chalk.bold(data.results[i].artist + ': ' + chalk.blue(data.results[i].groupName) + ' ' +
                      chalk.yellow(data.results[i].groupYear) + chalk.cyan(' ['+data.results[i].releaseType+']')));
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
      mainMenu();
    });
  } // default search

}

function onErr(err) {
  console.log(err);
  mainMenu();
}
