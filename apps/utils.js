let nodemailer = require("nodemailer");
var user = process.env.EMAIL;
var pass = process.env.PASS;

module.exports = {
	sendContactMail:(name,email,message)=>{
		// setup email data with unicode symbols
		let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // true for 465, false for other ports
		auth:{
				user: user, // generated ethereal user
				pass: pass // generated ethereal password
			}
		});
		let mailOptions = {
			from: `${email}`, // sender address
			to: 'mmogamer2.am@gmail.com', // list of receivers
			subject: 'DevBooks', // Subject line
			html: `<h3>Name:</h3> ${name}
			<br>
			<h3>Email:</h3> ${email}
			<br>
			<h3>Message:</h3> ${message}` // html body
		};
		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
		});
	},
	sendActivationMail: (name,email,message)=>{
		let transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465,
		secure: true, // true for 465, false for other ports
		auth:{
				user: user, // generated ethereal user
				pass: pass // generated ethereal password
			}
		});
		let mailOptions = {
			from: "DevBooks@gmail.com", // sender address
			to: `${email}`, // list of receivers
			subject: 'DevBooks', // Subject line
			html: `
			<h3>Name:</h3> ${name}
			<br>
			<h3>Email:</h3> ${email}
			<br>
			<h3>Message:</h3> ${message}` // html body
		};
		// send mail with defined transport object
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				return console.log(error);
			}
		});
	},
	removeEmptyStrings:(obj) => {
		let newObj = {};
		Object.keys(obj).forEach((prop) => {
			if (obj[prop] !== '' && obj[prop]!= undefined){ 
				newObj[prop] = obj[prop]; 
			}
		});
		return newObj;
	},
};