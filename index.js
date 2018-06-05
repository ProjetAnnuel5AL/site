var express  = require("express");
var bodyParser = require("body-parser");
var app = express();
var cookieParser = require("cookie-parser");
var session  = require("express-session");
var config = require("config");  // we use node-config to handle environments

var utils = require("./utils");
var urlApi = "http://localhost:8888";
var urlLocal = "http://localhost:8082"
require("./env.js");

var conf;
if (process.env.NODE_ENV === "test") {
    conf =	config.get("test");
} else if(process.env.NODE_ENV === "development") {
    conf = config.get("development");
} else if(process.env.NODE_ENV === "production"){
    conf = config.get("production");
}

module.exports = app;

app.use(
    session({
        secret: "vidyapathaisalwaysrunning",
        resave: true,
        saveUninitialized: true
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(__dirname + "/ressources"));

app.set("view engine", "ejs"); // set up ejs for templating

require("./routes")(app, urlApi, urlLocal, utils ,conf );

var port=process.env.PORT || 8082;

var server = app.listen(port, function() {
    console.log("Server started port "+port+"...");
});