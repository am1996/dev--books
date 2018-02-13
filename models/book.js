let mongoose = require("mongoose"),
	config = require("../config/config.js"),
	mongoosePaginate = require("mongoose-paginate"),
	Schema = mongoose.Schema;

var bookSchema = new Schema({
	title:{
		type: String,
		required: true,
	},
	author:{
		type: String,
		required : true,
	},
	description:{
		type: String,
		required:true,
	},
	links:{
		type:Array,
		required:true,
	},
	date:{
		type: Date, 
		default: Date.now
	},
	owner:{
		type:String,
		required:true,
	},
	image:{
		type:String,
		default:"/img/nocover.jpg"
	}
});

bookSchema.plugin(mongoosePaginate);
let con = mongoose.createConnection(config.DBURL);
let Book = con.model('Book', bookSchema);
module.exports = Book;