var bodyParser = require('body-parser');
var compress = require('compression');
var connect = require('connect');
var http = require('http');
var express = require('express');
var fs = require('fs');
var serveStatic = require('serve-static');

var app = express();
app.use(compress());
//app.use(serveStatic('.', {'index': ['game.html']}))

var jsonParser = bodyParser.json()

function timestamp () {
    return new Date().toISOString().replace(/:/g, "-").replace("T", "_").replace(".", "_");
}

function writeFile(path, data) {
    fs.writeFile(path, data, function (err) {
        if (err) {
            console.log('Fehler beim Schreiben');
            return console.log(err);
        }
        console.log('Datei geschrieben: ' + path);
    });
}

app.post('/beach', jsonParser, function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    function writeResponseToFile() {
        var filename = 'static/assets/beach.json'
        var data = JSON.stringify(req.body);
        writeFile(filename, data);
        console.log("Wrote beach.json");
    }
    writeResponseToFile();
    res.end();
});

// Copy Paste. Because fuck you.
app.post('/training', jsonParser, function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    function writeResponseToFile() {
        var filename = 'static/assets/training.json'
        var data = JSON.stringify(req.body);
        writeFile(filename, data);
        console.log("Wrote training.json");
    }
    writeResponseToFile();
    res.end();
});

app.post('/write', jsonParser, function (req, res) {
    if (!req.body) {
        return res.sendStatus(400);
    }
    function writeResponseToFile() {
        function makeFileName( ) {
            return "data/" + timestamp() + "_vpn_data.json.txt";
        }
        var filename = makeFileName();
        var data = JSON.stringify(req.body);
        writeFile(filename, data);
    }
    console.log("----------------------");
    console.log(JSON.stringify(req.body));
    console.log("----------------------");
    writeResponseToFile();
    res.end();
});

var port = process.env.PORT || 5000;

var server = http.createServer(app);
server.listen(port, function () {
    console.log("Serving on http://localhost:" + port);
});