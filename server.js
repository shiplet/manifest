var express = require('express'),
    path = require('path'),
    app = express();

app.use(express.static(__dirname));

app.use('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.listen(8080, function(){
    console.log('Listening on port 8080');
});
