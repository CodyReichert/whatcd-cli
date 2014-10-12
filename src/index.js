#!/usr/bin/env node

// imports
var settings = require('./settings');
var chalk = require('chalk');
var WhatCD = require('whatcd');
var prompt = require('prompt');
prompt.start();

// globals
var whatUrl = 'https://what.cd';
var client;
// chalk colors for output
var green = chalk.green();
var red = chalk.red()
var yellow = chalk.yellow();


//prompt.get(['username', 'password'], function(err, result) {
//  if (err) {
//    return onErr(err);
//  };
//  client =  new WhatCD(whatUrl, result.username, result.password);
//  console.log('Input received');
//  console.log('Email' + result.username);
//  console.log('Password' + result.password);
//  login(result.username, result.password);
//});

client =  new WhatCD(whatUrl, settings.username, settings.password);
login(settings.username, settings.password);

function login(username, password) {
  client.index(function(err, data) {
    if (err) {
      return onErr(err);
    }
    console.log(chalk.green('Welcome back, ' + username + '!'));
    typeOfSearch();
  });
}

function typeOfSearch() {
  console.log('(A)rtist Search, (B)rowse, (T)orrent Search, (Top) 10, (S)imilar Artist');
  prompt.get(['selection'], function(err, result) {
    if (err) {
      return onErr(err);
    }
    var searchType = result.selection;
    whatSearch(searchType);
  });
}

function whatSearch(searchType) {

  if (searchType !== 'B' && searchType !== 'Top') {
    console.log('Sorry, that search is not yet supported. Please check for an udpate');
    return onErr('Unsupported Search');
  }

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
        console.log(query + ' success!');
        for (var i = 0; i < data.results.length; i++) {
          console.log(data.results[i].artist);
        }
      });
    });
  }
  if (searchType === 'Top') {
    client.api_request({ action: "top10" }, function(err, data) {
      if (err) {
        console.log(err);
        return onErr(err);
      }
      console.log(data[0].caption);
      var result = data[0].results
      for (var i = 0; i < data[0].results.length; i ++) {
        console.log(result[i].artist + ': ' + result[i].groupName +
                    ' [' + result[i].format + ']');
      }
    });
  }
}

function onErr(err) {
  console.log(err);
  return 1;
}
