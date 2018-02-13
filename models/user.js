let mongoose = require("mongoose"),
	config = require("../config/config.js"),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	username:{
		type: String,
		required: true,
		unique:true
	},
	fullname:{
		type:String,
		required:true
	},
	email:{
		type: String,
		required : true,
		unique:true,
	},
	password:{
		type: String,
	},
	date:{
		type: Date, 
		default: Date.now
	},
	token:{
		type:String,
		unique:true
	},
	active:{
		type:Boolean,
		default:false,
	}
});

let con = mongoose.createConnection(config.DBURL);
let User = con.model('User', userSchema,"users");
module.exports = User;