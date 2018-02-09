let passport = require("passport");
let FacebookStrategy = require("passport-facebook").Strategy;
let LocalStrategy = require("passport-local").Strategy;
let User = require("../models/user.js");
let bcrypt = require("bcrypt");

passport.use(new LocalStrategy({
	    usernameField: 'email',
	    passwordField: 'password'
	},
	function(email, password, done) {
	User.findOne({ email: email }, function(err, user) {
		if (err) { return done(err); }
		if (!user) {
			return done(null, false, { message: 'Incorrect email.' });
		}
		if (!bcrypt.compareSync(password,user.password)) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		user.password = "";
		return done(null, user);
	});
}));

