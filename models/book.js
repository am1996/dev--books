let mongoose = require("mongoose"),
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

let con = mongoose.createConnection(process.env.DBURL);
let Book = con.model('Book', bookSchema);
module.exports = Book;