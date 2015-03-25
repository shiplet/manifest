var express = require('express'),
    path = require('path'),
    app = express();

app.use(express.static(__dirname));

app.get('/js/e.json', function(req, res){
    console.log('File requested at /js/e.js');
    res.sendFile(__dirname + '/js/e.json');
});


app.use('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Listening on port %d',  this.address().port, app.settings.en);
});

