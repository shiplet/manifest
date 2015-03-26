var express = require('express'),
    path = require('path'),    
    Firebase = require('firebase'),
    fb = new Firebase('https://manifest.firebaseio.com/production-env'),
    app = express();

app.use(express.static(__dirname));

app.get('/js/getEnv', function(req, res){
    fb.on('value', function(snapshot){
	res.json(snapshot.val());
	res.end();
    }, function(error){
	console.log(error);
    });
    console.log('REQUEST HEADERS: \n' + JSON.stringify(req.headers));
});

app.use('/', function(req, res){
    res.sendFile(__dirname + '/index.html');    
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Listening on port %d',  this.address().port, app.settings.env);
});

