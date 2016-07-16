var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// Get and parse HTML DOM
var cheerio = require('cheerio');
var request = require('request');
var $ = require('jQuery');

// Routes
var routes = require('./routes/index');
var scrape = require('./server');

// Express module
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// middlesware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// index page route to mw
app.use('/', routes);


/* * * * * * * * * * * * * * * * * * * * * * * * 
 *  APPLICATION LOGIC
 * * * * * * * * * * * * * * * * * * * * * * * */

// Starting point for the season
url = 'http://spfl.co.uk/premiership/archive/2015-2016/';

request({
  method: 'GET',
  url: url
}, function(err, response, body){
  if(err) return console.error(err);
  // load body into Cheerio
  $ = cheerio.load(body);
  $('.fixture_item > .teams > a').each(function(){ // do loop for each game in the season
    var fixtures = $(this).attr('href');
    // empty array to store string teamName, array players[]
    teams = [];
    // PARSE game links
    request({
      method: 'GET',
      url: 'http://spfl.co.uk'+fixtures+'#statistics',
    }, function(err,response,body){
      if(err) return console.error(err);
      $ = cheerio.load(body);

      // Initialise empty variables with global scope
      scoreHome=0, scoreAway=0, pointsHome=0, pointsAway=0, homeCorners=0, awayCorners = 0;
      homeTeamName='', awayTeamName='', homeFormation='', awayFormation = '';      
      homeSquad=[], awaySquad = [];

      title();
      squads();
      corners();
      games(homeSquad, homeTeamName);
      games(awaySquad, awayTeamName);

      function title() {
        // get home team name
        homeTeamName = $('#squad_box').children('.home').children('h3').html();         
        homeFormation = $('#squad_box').children('.home').children('p').children('strong').html();
        // get away team name 
        awayTeamName = $('#squad_box').children('.away').children('h3').html();
        awayFormation = $('#squad_box').children('.away').children('p').children('strong').html();
        
        // Add team objects to the TEAMS array 
        if(teams.length === 0) { // adding first element to object
          var obj1 = createTeam(homeTeamName);
          var obj2 = createTeam(awayTeamName);
        } else if (teams.length > 0) { // adding teams beyond the first one
            if(!teamLookUp(homeTeamName)){ createTeam(homeTeamName); }
            if(!teamLookUp(awayTeamName)){ createTeam(awayTeamName); }        
        }; // end of creating objects (lvl-1) in the teams[] 
        
        // check if team is already in the array to avoid duplicates
        function teamLookUp(teamName) {
          for(var i=0; i<teams.length; i++){
            if(teams[i].name === teamName) { return true; } // match made, dont add anything
            else if (i === teams.length-1) { return false; } // end of array reached, no match made
          }
        }; // end of teamLookUp()

        // if no team is there lets create a new one
        function createTeam(teamName){
          var teamObj = { // new team obj with empty players[]
            name: teamName,
            players: []
          };
          teams.push(teamObj); // finally add to the array 
        }; //end of createTeam()
      };

      function squads(){
        // PARSE squads
        $('#squad_box').each(function(){
          var data = $(this);

          var homeSquadRaw = data.children('.home').children('div').each(function(){
            $("span" ).remove();
            $("img" ).remove();
            homeSquad.push($(this).html());
          });        
          var awaySquadRaw = data.children('.away').children('div').each(function(){
            $("span" ).remove();
            $("img" ).remove();
            awaySquad.push($(this).html());
          });
        }); // end of squad DOM parse

        addNewPlayers(homeSquad, homeTeamName);
        addNewPlayers(awaySquad, awayTeamName);

        function addNewPlayers(squad, teamName){
          // add new empty player arrays 
          for(var iC=0; iC<teams.length; iC++){ // loop CLUB NAMES
            if(teams[iC].name === teamName){ //index FOUND
              for(var iS=0; iS<squad.length; iS++){ // loop SQUAD LIST

                // if player is the first one added
                var playersLength = teams[iC].players.length;

                if(playersLength === 0) {
                  createPlayer(squad[iS], iC);

                  
                  for(var iP=0; iP<=playersLength; iP++) { // loop UNIQUE PLAYERS LIST


                    var o = teams[iC].players[iP].name;
                    console.log('team: '+teams[iC].name+', Player: '+o+", length: "+playersLength);
                    if(o === squad[iS]) { break; } // match found, player is in array 
                    else if (iC === playersLength-1) { // end of player list no match made 
                      createPlayer(squad[iS], iC);
                    }
                  }
                }
              };
            };
          };
        }; // end of addNewPlayers()  

        function createPlayer(playerName, teamIndex) {
          var playerObj = { name: playerName, games: [] };
          // console.log(playerObj);
          teams[teamIndex].players.push(playerObj); 
        }
      };


      function corners () {
        // PARSE corner kicks
        $('#statistics > div:nth-child(3) > div:nth-child(3)').each(function(){
          data = $(this);
          homeCorners = data.children('.home').children('.stat_bar').children('.stat_num').html();
          awayCorners = data.children('.away').children('.stat_bar').children('.stat_num').html();
        }); // end of parse corners method        
      }

      function games(squad, squadName){
        /*
         *  All stats have been gathered - add player objects 
         */
        //  create player object
        for(var i=0; i<squad.length; i++){
          // Add object at OBJECT LEVEL 3
          // find player in teams > player
          for(var t=0; t<teams.length; t++){ // scan teams name

            if(teams[t].name === squadName) { // team name found index = t

              // console.log(teams[t].name+" - "+squadName); // MATCHES CONFIRMED

              for(var p=0; p < teams[t].players.length; p++){ // scan players names in index = t

                // console.log(teams[t].players[p]); <<<<<<<<<<<

                // if(teams[t].players[p] === squad[i]){//player name found
                
                //   var gameObj = {
                //     opposition: awayTeamName ,
                //     cornersFor: homeCorners ,
                //     cornersAgainst: awayCorners
                //   }   

                //   teams[t].players[p].push(gameObj);

                //   console.log("Player name: "+squad[i]+", Opposition: "+gameObj.opposition+", For: "+gameObj.cornersFor+", Against: "+gameObj.cornersAgainst);
                // };
              };
            };
          };
        };
      };
    });
  });
});


























/* * * * * * * * * * * * * * * * * * * * * * * * 
 *  NODEJS > APP.JS > ERROR HANDLES
 * * * * * * * * * * * * * * * * * * * * * * * */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
};

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;


/*
        ----- FINAL FORMAT OF DATA -----

        teams = [
                  { teamName: '',                             (--- obj lvl 1, unique)
                    players: [
                              { playerName: '',               (--- obj lvl 2, unique)
                                games: [
                                        { opposition: '',     (--- obj lvl 3)
                                          cornersFor: '',
                                          cornersAgainst: ''
                                        }                     (--- end 3)
                                ]
                              }                               ( --- end 2)
                    ]
                  },                                          (--- end 1)

                  { teamName: '',                             (--- obj lvl 1, unique)
                    players: [
                              { playerName: '',               (--- obj lvl 2, unique)
                                games: [
                                        { opposition: '',     (--- obj lvl 3)
                                          cornersFor: '',
                                          cornersAgainst: ''
                                        }                     (--- end 3)
                                ]
                              }                               ( --- end 2)
                    ]
                  }                                           (--- end 1)
        ]
      */
