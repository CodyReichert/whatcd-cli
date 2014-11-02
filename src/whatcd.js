#!/usr/bin/env node

// imports
var https    = require('https');
var fs       = require('fs');
var path     = require('path');
var chalk    = require('chalk');
var WhatCD   = require('whatcd');
var settingsPath = path.join(process.env['XDG_CONFIG_HOME'] || path.join(process.env['HOME'], '.config'), 'whatcd');

// prompt settings
var prompt = require('prompt');
prompt.message = '';
prompt.delimiter = '';
prompt.start();

// load configuration or prompt for it
var whatUrl = 'https://what.cd';
var settings = {};
var client = {};

if (fs.existsSync(settingsPath)) {
  var configFile = require(settingsPath);
  settings.username = configFile.username
  settings.password = configFile.password
  settings.torrentDirectory = configFile.torrentDirectory
  createClient();

} else if (fs.existsSync(path.join(process.env['HOME'], '.whatcd'))) {
  var configFile = require(path.join(process.env['HOME'], '.whatcd'));
  settings.username = configFile.username
  settings.password = configFile.password
  settings.torrentDirectory = configFile.torrentDirectory
  createClient();

} else { //no config found, prompt for credentials
  prompt.get(['username'], function(err, result) {
    if (err) {
      return onErr(err);
    }
    settings.username = result.username;
    prompt.get(['password'], function(err, result) {
      if (err) {
        return onErr(err);
      }
      settings.password = result.password;
      settings.torrentDirectory = '';
      console.log(chalk.gray('Downloads will save in the current working directory'));
      createClient();
    });
  });
}

// what.cd client
function createClient() {
  client =  new WhatCD(whatUrl, settings.username, settings.password);
  login(client, settings.username);
}

var configError = function() {
  console.log(chalk.white('\nCould not log in or find a config file.'));
  console.log(chalk.white('You need to add a configuration file at $XDG_CONFIG_HOME/whatcd or ~/.whatcd '));
  console.log(chalk.white ('and add the following contents: \n'));
  console.log(chalk.red('  module.exports = {'));
  console.log(chalk.red('    username: "your username",'));
  console.log(chalk.red('    password: "your password",'));
  console.log(chalk.red('    torrentDirectory: "/path/to/save/torrents"'));
  console.log(chalk.red('  }'));
  console.log(chalk.white('Or try logging in again.'));
}

//-----------------------------------//
// Authentication. Get sent to the main
// menu upon successful authentication
//-----------------------------------//
var authkey;
var passkey;
function login(client, username) {
  client.index(function(err, data) {
    if (err) {
      configError(); // login failed
      console.log('Couldn\'t log in. Check your credentials and try again');
      return err;
    }
    authkey = data.authkey;
    passkey = data.passkey;
    console.log(chalk.blue(new Array(process.stdout.columns + 1).join('_')));
    console.log(chalk.blue.bold('\n WhatCD-cli - Copyright 2014 - GNU GPL v3.0\n') +
                                ' For issues, visit http://github.com/CodyReichert/whatcd-cli');
    console.log(chalk.green.bold('\n Welcome back, ' + username + '!'));
    mainMenu();
  });
}

// Main menu
function mainMenu() {
  console.log(chalk.blue(new Array(process.stdout.columns + 1).join('_') + '\n') +
                          chalk.magenta('Search for any artist, album or torrent, or use one of the advanced search' +
                          ' commands below'));
  console.log(chalk.bold('(S)') + 'imilar Artist,' +
              chalk.bold('(D)') + 'ownload, ' +
              chalk.bold('(Top)') + ' 10,' +
              chalk.bold('(A)') + 'rtist Search,' +
              chalk.bold('(T)') + 'orrent Search,' +
              chalk.bold('(H)') + 'elp, ' +
              chalk.bold('(E)') + 'xit');
  prompt.get(['search'], function(err, result) {
    if (err) {
      return onErr(err);
    }
    var searchType = result.search;
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
          console.log('\n' + torrentFilepath);
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
  else if (searchType === 'H' || searchType === 'h') {
    console.log(chalk.blue.bold('\nWhatCD-cli - Copyright 2014 Cody Reichert - GNU GPL v3.0\n'));
    console.log(chalk.blue(
      'This command line interface allows you to browse what.cd torrents, arists,\n' +
      'and albums (and a couple other things) directly from the command line.\n' +
      'Currently, most of the searches you can make on what.cd are supported.\n'
                          ));
    console.log(chalk.blue(
      'To search, you can enter a query from the main menu (which will match all\n' +
      'albums, artists, singles, etc), or you can choose one of the advanced search' +
      ' options:\n\n'
                          ));
    console.log(chalk.blue(
      chalk.bold('  - (D) Download: Enter "D" or "d",') + ' from the main menu to download a torrent file.\n' +
      '        You will be prompted for the ID. It will save to your torrentsDirectory set in ' +
      'your settings.js file.\n'
                          ));
    console.log(chalk.blue(
      chalk.bold('  - (Top) Top 10: Enter "Top" or "top"') + ' from the main menu to view the top 10 most\n' +
      '        active torrents of the day.\n'
                          ));
    console.log(chalk.blue(
      chalk.bold('  - (S) Similar: Enter "S" or "s"') + ' from the main menu to find similar artists.\n' +
      '        You will be prompted for an artist name. It will show the first 10 (or less) matches.\n'
                          ));
    console.log(chalk.blue(
      chalk.bold('  - (A) Artist search:') + ' Not yet implemented.\n'
                          ));
    console.log(chalk.blue(
      chalk.bold('  - (T) Torrent search:') + ' Not yet implemented.\n'
                          ));
    console.log(chalk.blue('For more help, licensing information, or to submit issues\n' +
                           'view the README at http://github.com/CodyReichert/whatcd-cli'));
    mainMenu();
  }

  // Throw errors for unsupported features
  else if (searchType === 'A' || searchType === 'a' || searchType === 'T' || searchType === 't') {
    var error = chalk.yellow('Sorry, that search is not yet supported. Please back check for an udpate');
    return onErr(error);
  }

  else if (searchType === 'E' || searchType === 'e') {
    console.log( "\nGracefully shutting down.\n" );
    process.exit();
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
