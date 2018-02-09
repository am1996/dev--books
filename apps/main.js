let express = require("express"),
	controllers = require("./middlewares.js"),
	Book = require("../models/book.js"),
	User = require("../models/user.js"),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	utils = require("./utils.js"),
	bcrypt = require("bcrypt"),
	valSchemas = require("./validation"),
	passport =require("passport"),
	passportConfig = require("../config/passportConfig.js"),
	router = express.Router();

//middlewares
router.use(controllers.loginRequired);

//routes
router.get("/",(req,res)=>{
	var q ={};
	var value = new RegExp(req.query.q+".*","gi")
	if(req.query.q) q = {$or:[{title:value},{author:value}]};
	let books = Book.find(q,(err,books)=>{
		res.render("index.html",{
			books:books,
			success: req.flash("success"),
		});
	});
});

router.get("/about",(req,res)=>{
	res.render("about.html");
});
router.get("/contact",(req,res)=>{
	res.render("contact.html");
});
router.post("/contact",(req,res)=>{
	var content = {
		fullname:req.body.name,
		email:req.body.email,
		msg:req.body.message
	};
	var result = valSchemas.validateContact(content);
	if(result.error){
		res.render("contact.html",{
			errors : result.error
		});
	}else{
		utils.sendContactMail(content.fullname,content.email,content.msg);
		req.flash("success","Your mail was sent successfully.");
		res.redirect("/");
	}
});

router.get("/dashboard",(req,res)=>{
	Book.find({owner:req.user._id},(err,books)=>{
		if(err) console.log(err);
		res.render("dashboard.html",{
			books:books,
			success: req.flash("success"),
			errors: req.flash("errors"),
		});
	});
});
router.post("/dashboard/change_info",(req,res)=>{
	let userData = {
		fullname: req.body.fullname,
		email : req.body.email,
		password: req.body.password
	};
	let result = valSchemas.validateEditedUser(userData);
	if(result.error){
		req.flash("errors",result.error);
		res.redirect("dashboard");
	}else{
		userData = utils.removeEmptyStrings(userData);

		if(userData.password) userData.password = bcrypt.hashSync(userData.password, 10);
		User.findById(req.user._id, (err,user)=>{
			if(err) console.log(err);

			if(userData.email){
				user.active = false;
				user.token = bcrypt.hashSync(Date.now()+user.username,5);
				user.save(err=>console.log(err));
				utils.sendActivationMail("DevBooks",userData.email,`
				click to activate <a 
				href="${req.protocol}://${req.get('host')}/user/${user._id}?token=${user.token}">
					Click Me
				</a>`);
			};

			user.update({ $set:{...userData} },(err,user)=>{
				if(err) console.log(err);
				req.flash("success","Successfully Edited User Info");
				res.redirect("/dashboard");
			});
		});
	}
});

router.get("/login",(req,res)=>{
	res.render("login.html",{
		success:req.flash("success"),
		error: req.flash("error"),
	});
});
router.post('/login',passport.authenticate('local',{successRedirect: '/',
					failureRedirect: '/login',
					failureFlash: true })
);

router.get('/logout',(req,res)=>{
	if(req.user){
		req.logout();
		req.flash('success',"You are logged out.");
		res.redirect('/');
	}else{
		res.redirect('/');
	}

});

router.get("/register",(req,res)=>{
	res.render("register.html");
});
router.post("/register",(req,res)=>{
	let userData = {
		fullname: req.body.fullname,
		username: req.body.username,
		email : req.body.email,
		password: req.body.password
	};
	let result = valSchemas.validateUser(userData);
	if(result.error){
		res.render("register.html",{
			errors:result.error,
		});
	}else{
		userData.password =  bcrypt.hashSync(userData.password, 10);
		userData.token = bcrypt.hashSync(Date.now()+userData.username,5);

		let newUser = new User(userData);
		newUser.save( (err)=>{
			if(err){
				res.render("register.html",{
					error:"Username/Email already exists."
				});
			}else{
				utils.sendActivationMail("DevBooks",userData.email,`
				click to activate <a 
				href="${req.protocol}://${req.get('host')}/user/${newUser._id}?token=${userData.token}">
					Click Me
				</a>`);
				req.flash("success",`You've registered.
					Check your mail to activate your account.`)
				res.redirect("/login");
			}
		});
	}
});
router.get("/user/forgot-password",(req,res)=>{
	if(req.query.token && req.query.id){
		User.findOne({_id:req.query.id},(err,user)=>{
			if(req.query.token == user.token){
				req.login(user,(err)=>{});
				user.token = "";user.save();
				res.redirect("/");
			}else{
				req.flash("error","user id or token is incorrect");
				res.redirect("/user/forgot-password");
			}
		});
	}else{
		res.render("forgotmail.html",{
			success:req.flash("success"),
			error:req.flash("error")
		});
	}
});
router.post("/user/forgot-password",(req,res)=>{
	User.findOne({email:req.body.email},(err,user)=>{
		if(user){
			user.token = bcrypt.hashSync(Date.now()+user.username,5);
			user.save();
			utils.sendActivationMail("DevBooks",user.email,`
				click to activate <a 
				href="${req.protocol}://${req.get('host')}/user/forgot-password?id=${user._id}&token=${user.token}">
					Click Me
				</a>`);
			req.flash("success","Check Your Mail For Restoration Link.");
			res.redirect("/user/forgot-password");
		}else{
			req.flash("error","User not Found.");
			res.redirect("/user/forgot-password");
		}
	});
});

router.get("/user/:id",(req,res)=>{
	if(!req.query.token) res.status(404).render("404.html");
	else{
		User.findById(req.params.id,(err,user)=>{
			if(!user){
				res.render("404.html");
			}else if(user.token == req.query.token){
				user.active = true;
				user.token = "";
				user.save();
				req.flash("success","Your account got activated.");
				res.redirect("/");
			}else{
				req.flash("success","The token is incorrect.");
				res.redirect("/");
			}
		});
	}
});

router.get("/add",(req,res)=>{
	res.render("addBook.html");
});
router.post("/add",(req,res)=>{
	let links = [req.body.linkOne,req.linkTwo]
	.filter(n=> n!="").filter(n=> n!=undefined)
	let newBook = {
		title: req.body.title,
		author:req.body.author,
		description:req.body.description,
		links:links,
		owner: req.user._id
	};
	if(req.user.active){
		let book = new Book(newBook);
		book.save();
		req.flash("success","You added a new book.");
	}
	res.redirect("/");
});

router.get("/book/:id",(req,res)=>{
	Book.findOne({_id:req.params.id},(err,book)=>{
		res.render("details.html",{
			book:book
		});
	});
});
router.all("/book/:id/delete",(req,res)=>{
	if(req.method == "GET") res.render("delete.html",{book:req.params.id});
	else if(req.method == "POST"){
		Book.findById(req.params.id,(err,book)=>{
			if(book.owner == req.user._id){
				book.remove();
				req.flash("success","Successfully Deleted the book.")
				res.redirect("/");
			}else{
				res.status(402);
				res.end("Forbidden");
			}
		});
	}
});

router.all("/book/:id/edit",(req,res)=>{
	if(req.method == "GET") res.render("edit.html",{book:req.params.id});
	else if(req.method == "POST"){
		Book.findById(req.params.id,(err,book)=>{
			var links = [
						(req.body.linkOne == "") ? 
						book.links.linkOne:req.body.linkOne,
						(req.body.linkTwo == "")? 
						book.links.linkTwo:req.body.linkTwo
						].filter(n=> n!="").filter(n=> n!=undefined);

			var newBook = {
				title :(req.body.title == "")? book.title:req.body.title,
				author:(req.body.author == "")? book.author:req.body.author,
				description:(req.body.description == "")? book.description:req.body.description,
				link : links
			};
			if(book.owner == req.user._id){
				book.update({$set:{...newBook}},(err,book)=>{
					req.flash("success","Successfully Edited the book.")
					res.redirect("/");
				});
			}else{
				res.status(402);
				res.end("Forbidden");
			}
		});
	}
});
router.get("*",(req,res)=>{
	res.render("404.html");
});
module.exports = router;