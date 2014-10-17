## What.cd Command line Tool
--------------

A command line tool for browsing, searching, and downloading content from what.cd.

#### Install

1) Git clone the repo
2) `npm install`
3) Create the file `src/settings.js` file and put this in it:
    module.exports =  {
      username = "Your what.cd username"
      password = "Your what.cd password"
      torrentDirectory = "/path/to/save/torrent"
    }
4) Run the app:
    node src/index.js

#### Usage

Run the app with `node src/index.js` and follow the prompts. Here are the options:

Note, most of the searches are case and space sensitive.
*Basic Search*
- From the main menu, you can enter one of the displayed search types, or just enter any string to browse all torrents.

*Search by Artist*
`A`, `a`, `artist`, `Artist`
- This search returns all torrents which contain the artist.

*Search by Torrent*
`A`, `a`, `artist`, `Artist`
- Returns all torrents that contain the query. This can be artist, album, genre, etc.

*Top 10*
`Top`, `top`
- This dispays the Top 10 torrents of that day.

*Download Torrents*
`D`, `d`, `Download`, `download`
- To download a torrent, use one of the commands above from the main menu. You will be prompted for an
  id; enter the ID of the torrent you want to download. All of the browse and search functions display the
  torrent id.


#### Options

Browse and Top10 are the only function searches currently. All others will return an error. Check back soon for more updates.


### Licensing and Disclaimer
#### GNU General Public License v3.0

**This software is licensed under the GNU General Publice License Version 3.0**

WhatCD-cli is a command-line interface for browsing and downloading what.cd torrents.


Copyright (C) 2014 Cody Reichert


This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see [http://www.gnu.org/licenses/](http://www.gnu.org/licenses/).

For any additional information or questions, you can contact me
at: [codyreichert@gmail.com](mailto:codyreichert@gmail.com)
