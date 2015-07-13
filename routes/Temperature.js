var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var regex = require('regex')

/* GET about page. */
router.get('/', function(req, res, next) {
    var city = req.query.newcity ;

    ValidateCity(city, function(err){
        if(err){
            console.log('Invalid Input');
            //return;

            res.render('./InValidTemperature',
                { title: 'Temperature App' ,
                    name: 'Ravi',
                    data: "Not a Valid City"
                });
        }
        else
        {
            GetWeatherDetails(city, function (err, weatherData) {
                if (!err) {
                    //console.log(" Error: ", err, weatherData);
                    var Average;
                    res.render('Temperature',
                        { title: 'Temperature App' ,
                            name: 'Ravi',
                            data: weatherData
                        });
                }
                else
                {
                    console.log("ELSE Error: ", err, weatherData);
                    res.render('Temperature',
                        { title: 'Temperature App' ,
                            name: 'Ravi',
                            data: weatherData
                        });
                }
            });
        }
    });

});

function ValidateCity(city, callback)
{
    var rePattern = new RegExp(/^[a-zA-Z]+$/);

    if(city.match(rePattern))
    {
        console.log('city is Valid', city);
        callback(false);
        return;
    }
    else
    {
        console.log('city is InValid', city);
        callback(true);
        return;
    }
}

function GetWeatherDetails(city, callback) {
    var parsedCollection = {};
    async.parallel([
            function (callback) {
                var uri = 'http://api.openweathermap.org/data/2.5/weather?q=' + city;
                request(uri, function (err, response, body) {
                    if (err || (response.statusCode != 200)) {
                        console.log("OW Error: ",err);
                        callback(true);
                        return;
                    }

                    var openAPIparsedData = JSON.parse(body);
                    //console.log("OW: ", openAPIparsedData);
                    callback(false, openAPIparsedData);
                });
            },

            function (callback) {
                var key = "046ff30a83905220b61f34433761e";
                var uri  = "https://api.worldweatheronline.com/free/v2/weather.ashx?q=" + city + "&key=" + key + "&format=json";
                request(uri, function (err, response, body) {
                    if (err || (response.statusCode != 200)) {
                        console.log("WW Error: ",err);
                        callback(true);
                        return;
                    }

                    var parsedData = JSON.parse(body);
                    //console.log("WW: ",body);
                    callback(false, parsedData);
                });
            }
        ],

        function (err, data) {

            //console.log("Data: ", JSON.stringify(data));
            if (!err) {
                console.log("if");
                parsedCollection = data;
                //callback(false, parsedCollection);
            }

            callback(false, parsedCollection);
            //console.log("weatherp[0]: ", parsedCollection[0].message);
            if (parsedCollection[0].message == 'Error: Not found city')
            {
                var observedData = {};
                callback(false, null);
            }
        }
    );

}

module.exports = router;
