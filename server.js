var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    Firebase = require('firebase'),
    fb = new Firebase('https://manifest.firebaseio.com/env'),
    app = express();

app.use(express.static(__dirname));

app.get('/js/getEnv', function(req, res){
    console.log('File requested at /js/getEnv');
    fb.on('value', function(snapshot){
	res.json(snapshot.val());
    }, function(error){
	console.log(error);
    });
});

app.use('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
    console.log(req.params);
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Listening on port %d',  this.address().port, app.settings.env);
});

