let Joi = require("joi");

var userSchema = Joi.object().keys({
	fullname: Joi.string().required(),
	username: Joi.string().min(3).max(30).required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
});

var bookSchema = Joi.object().keys({
	title: Joi.string().required(),
	author: Joi.string().required(),
	description: Joi.string(),
	link: Joi.string().uri().required(),
});

var contactSchema = Joi.object().keys({
	fullname: Joi.string().required(),
	email: Joi.string().email().required(),
	msg : Joi.string().required()
});

var editSchema = Joi.object().keys({
	fullname: Joi.string(),
	email: Joi.string().email(),
	password : Joi.string()
});

module.exports = {
	validateUser: (content)=>{
		return Joi.validate(content,userSchema,{
			abortEarly:false
		});
	},
	validateBook: (content)=>{
		return Joi.validate(content,bookSchema,{
			abortEarly:false
		});
	},
	validateContact:(content)=>{
		return Joi.validate(content,contactSchema,{
			abortEarly:false
		});
	},
	validateEditedUser: (content)=>{
		return Joi.validate(content,editSchema,{
			abortEarly:false
		});
	}
}