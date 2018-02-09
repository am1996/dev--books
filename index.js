let express = require("express"),
	nunjucks= require("nunjucks"),
	bodyParser = require("body-parser"),
	index = require("./apps/main.js"),
	cookieParser = require("cookie-parser"),
	mongoose = require("mongoose"),
	session = require("express-session"),
	MongoStore = require("connect-mongo")(session),
	flash = require("connect-flash"),
	passport = require("passport"),
	helmet = require("helmet"),
	app = express();
//middleware
mongoose.connect(process.env.DBURL);
app.use(helmet());
nunjucks.configure('views', { //views file
    autoescape: true,
    express: app
});
app.use(cookieParser('SsstaatssS',));
app.use(session({
	resave: true,
	proxy: true,
	saveUninitialized: true,
	secret:"SsstaatssS",
	cookie: { 
		path: '/', 
		httpOnly: true, 
		maxAge: 36000000
	},
	store : new MongoStore({
		mongooseConnection: mongoose.connection,
		ttl: 14*24*60*60
	}),
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("static"));
app.use((res,req,next)=> {
	app.locals.res = res; 
	next();
});
//routes
app.use("/",index);

const port = process.env.PORT || 3000;
app.listen(port);