let Book = require("../models/book.js");
module.exports={
	//middlewares
	loginRequired:(req,res,next)=>{
		let url = req.originalUrl;
		if(!req.user){
			if(url.search(/add|delete|edit|dashboard/i) != -1){
				res.status(404).render("404.html");
			}else{
				return next();
			}
		}else if(req.user){
			if(!req.user.active && url.search(/add|delete|edit/i) != -1){
				req.flash("success","You need to activate your account.");
				res.redirect("/");
			}else if(url.search(/login|register/i) != -1){
				res.redirect("/");
			}else{
				return next();
			}
		}else{
			return next();
		}
	},
}