const path = require("path");
const express = require("express");
const compression = require("compression");
const favicon = require("serve-favicon");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const expressHandlebars = require("express-handlebars");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const url = require("url");
const redis = require("redis");
const csrf = require("csurf");

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURL = process.env.MONGODB_URI || "mongodb://localhost/Proj2";

const mongooseOptions = {
	useNewUrlParser    : true,
	useUnifiedTopology : true,
//   useCreateIndex: true,
};

mongoose.connect(dbURL, mongooseOptions, (err) => {
	if (err) {
		console.log("Could not connect to database");
		throw err;
	}
});

let redisURL = {
	hostname : "redis-13179.c74.us-east-1-4.ec2.cloud.redislabs.com",
	port     : "13179",
};

let redisPASS = "ZvabL60hoDH2UvIqrOoFZVvX4hjnX702";
if (process.env.REDISCLOUD_URL) {
	redisURL = url.parse(process.env.REDISCLOUD_URL);
	[, redisPASS] = redisURL.auth.split(":");
}
const redisClient = redis.createClient({
	host     : redisURL.hostname,
	port     : redisURL.port,
	password : redisPASS,
});

const router = require("./router");

const app = express();
app.disable("x-powered-by");
app.use("/assets", express.static(path.resolve(`${__dirname}/../hosted/`)));
app.use("/docs", express.static(path.resolve(`${__dirname}/../docs/`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
app.use(compression());
app.use(bodyParser.urlencoded({
	extended : true,
}));

app.use(session({
	key   : "sessionid",
	store : new RedisStore({
		client : redisClient,
	}),
	secret            : "hate is all i have",
	resave            : true,
	saveUninitialized : true,
	cookie            : {
		httpOnly : true,
	},
}));

app.engine("handlebars", expressHandlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", `${__dirname}/../views`);
app.use(cookieParser());

app.use(csrf());
app.use((err, req, res, next) => {
	if (err.code !== "EBADCSRFTOKEN")
		return next(err);
	console.log("Missing CSRF token");
	return false;
});

router(app);

app.listen(port, (err) => {
	if (err)
		throw err;
	console.log(`Listening on port ${port}`);
});
