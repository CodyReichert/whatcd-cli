## What.cd Command line Interface

A command line interface for browsing, searching, and downloading from what.cd.

### Install

The quickest way to install is to get the latest version from npm:

    $ npm install -g whatcd-cli
  or get the latest from github
  
    $ npm install -g CodyReichert/whatcd-cli

And that's it! You can run it with:

    $ whatcd

**You'll need to create a config file with your username a password. Read more below.**

### Configuration

Store your what.cd credentials in a .whatcd config file in the top level of your home
directory (`~/.whatcd` or `/home/<username>/.whatcd`).

    module.exports =  {
      username: "Your what.cd username",
      password: "Your what.cd password",
      torrentDirectory: "/path/to/save/torrents/"
    }

The torrentDirectory is where whatcd-cli will save all torrent files. My recommendation
is to have your torrent client automatically start files added to this directory.

### Usage

This command line interface allows you to browse what.cd torrents, arists,
and albums (and a couple other things) directly from the command line.
Currently, most of the searches you can make on what.cd are supported.

To search, you can enter a query from the main menu (which will match all
albums, artists, singles, etc), or you can choose one of the advanced search options:


  - **(D) Download: Enter "D" or "d"**, from the main menu to download a torrent file.
        You will be prompted for the ID. It will save to your torrentsDirectory set in your settings.js file.
  - **(Top) Top 10: Enter "Top" or "top"** from the main menu to view the top 10 most
        active torrents of the day.
  - **(S) Similar: Enter "S" or "s"** from the main menu to find similar artists.
        You will be prompted for an artist name. It will show the first 10 (or less) matches.
  - **(A)** Artist search: Not yet implemented.
  - **(T)** Torrent search: Not yet implemented.

For more help, licensing information, or to submit issues
view the README at http://github.com/CodyReichert/whatcd-cli

### Roadmap and Future Development

 - One of the first things I want to do is have single command interactions, so the interactive mode is
 optional. So you could just do something like this to download a file:

      $ whatcd -d "torrent-id"
    
    // or this to get album an album in a certain format
    
      $ whatcd -a "Brand New" -b "Daisy" -f "FLAC"

### Alternative installations

If you don't have or want to use npm, you can clone the repo and run directly with node:

    git clone git@github.com/CodyReichert/whatcd-cli
    cd whatcd-cli/
    npm install
    // **Follow the config files steps above**
    node src/whatcd.js
    
The npm install command above will install the latest changes. If you have problems
install the lastest stable release instead.

    npm install -g CodyReichert/whatcd-cli/0.1.0

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
