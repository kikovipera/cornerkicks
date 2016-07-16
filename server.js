// var express = require('express');
// var fs = require('fs');
// var request = require('request');
// var cheerio = require('cheerio');
// var pretty = require('pretty');
// var app     = express();

// app.get('/scrape', function(req, res){

// url = 'http://spfl.co.uk/premiership/archive/2015-2016/';

// // Extract tags from the returned DOM
// request(url, function(error, response, html){
//     if(!error){
//         var $ = cheerio.load(html);

//         var link, home, score, away, date;
//         var json = new Object();

//         $('.fixture_item > .teams > a').each(function(){
//             var data = $(this);
//             var extLink = data.attr('href');
//             var extHome = data.children('.home').html();
//             var extScore = data.children('.score').html();
//             var extAway = data.children('.away').html();
//             // create new JSON fixture object 
//             var obj = {
//                 "link": extLink,
//                 "home": extHome,
//                 "score": extScore,
//                 "away": extAway,
//             };
//             // push to the json file
//             json.push(obj);
//         });

//         for (x in json) {
//             var data = JSON.parse(data);
//             // var fixture_url = 'http://spfl.co.uk'+ x.link;
//             var fixture_url = data.home;
//             console.log(fixture_url);
//         }

// }

// // To write to the system we will use the built in 'fs' library.
// // In this example we will pass 3 parameters to the writeFile function
// // Parameter 1 :  output.json - this is what the created filename will be called
// // Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
// // Parameter 3 :  callback function - a callback function to let us know the status of our function

// fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

//     console.log('File successfully written! - Check your project directory for the output.json file');

// })

// // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
// res.send('Check your console!')

//     }) ;
// })

// app.listen('8081')
// console.log('Magic happens on port 8081');
// exports = module.exports = app;


