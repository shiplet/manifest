var express = require('express'),
    path = require('path'),    
    app = express();

app.use(express.static(__dirname));

app.use('/', function(req, res){
    res.sendFile(__dirname + '/index.html');    
});

app.listen(process.env.PORT || 3000, function(){
    console.log('Listening on port %d',  this.address().port, app.settings.env);
});

