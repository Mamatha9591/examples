var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request =  require ('request');

app.use (bodyParser.urlencoded({extended :  false }));
app.use( bodyParser.json());

// app.post('/weather', function (req, res) {
//   var city = req.body.queryResult.parameters.City;
//   var respuestaWebhook = {
//     fulfillmentText: 'Response from webhook ' +  city
//   }; 
//   res.json(respuestaWebhook);
// });

app.post('/weather' ,function(req,res){
    // We extract the city parameter, which is inside the agent's request (webhook)
    var city =req.body.queryResult.parameters.City ;
    var cityCode = 0;
    var url =' http://dataservice.accuweather.com/locations/v1/cities/mx/search?apikey=jRA2Qxo7B4marmaKlBKjn1yUqKrUeHl9&q='+ city;
    console.log ( 'response from '+city);
  
    // Variable JSON type to save the response to send to the agent
    var resClima = {
      fulfillmentText :  ' '
    };
  
    // We perform the query to find the city by name
    request (url, {json:true }, (err,resp,body) => {    
      // If there is an error processing the city search request
      if (err) {
        console.log( ' Error when searching the city ' );
        console.log (err);
        resClima.fulfillmentText='It was not possible to consult your city at this time';
      }
      else {
        if (body.length ==  0 ) {
          console.log ('City not found');
          resClima.fulfillmentText=' Your city has not been found, make sure you have written it correctly';
          res.json (resClima);
        }
        else {
          // We extract the id from the city
          console.log(body)
          cityCode=body[0].Key ;
          // and we set up the url for the climate query
          var url ='http://dataservice.accuweather.com/currentconditions/v1/ '+cityCode+'?apikey=jRA2Qxo7B4marmaKlBKjn1yUqKrUeHl9&language=es';
          
          // We carry out the query to find the climate of the city by its id
          request (url, {json :  true }, ( err2 , resp2 , body2 ) => {
            // in case of error we indicate a problem
            if (err2) {
              console.log('Problem when obtaining the weather');
              resClima.fulfillmentText='It was not possible to consult the climate of your city at this time';
            }
            // We extract the information from the API, and arm the response to send to the agent
            // more details https://developer.accuweather.com/accuweather-current-conditions-api/apis/get/currentconditions/v1/%7BlocationKey%7D
            else{
              resClima.fulfillmentText='The temperature of '+city+'is'+body2[0].Temperature.Metric.Value +'and'+ body2[0].WeatherText;          
            }
  
            res.json(resClima);
          });
        }
      }
    });
  });
  

app.listen(3000, function () {
  console.log('server started at 3000');
});

