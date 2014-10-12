#!/usr/bin/env node

// imports
var settings = require('./settings');
var chalk = require('chalk');
var WhatCD = require('whatcd');

// prompt settings
var prompt = require('prompt');
prompt.message = '';
prompt.delimiter = '';
prompt.start();

// globals
var whatUrl = 'https://what.cd';
var client;
// chalk colors for output
var green = chalk.green();
var red = chalk.red()
var yellow = chalk.yellow();

client =  new WhatCD(whatUrl, settings.username, settings.password);
login(settings.username, settings.password);

function login(username, password) {
  client.index(function(err, data) {
    if (err) {
      return onErr(err);
    }
    console.log(chalk.green('\n Welcome back, ' + username + '!'));
    typeOfSearch();
  });
}

function typeOfSearch() {
  console.log(chalk.blue('_______________________________________________________________________'));
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
    console.log(chalk.yellow('Sorry, that search is not yet supported. Please check for an udpate'));
    typeOfSearch();
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
        if (data.results.length === '0') {
          console.log('Sorry, no results found');
        }
        for (var i = 0; i < data.results.length; i++) {
          if (data.results[i].artist === query) {
            console.log(data.results[i].artist + ': ' + data.results[i].groupName);
          }
        }
        typeOfSearch();
      });
    });
  }
  if (searchType === 'Top') {
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
}

function onErr(err) {
  console.log(err);
  return 1;
}
