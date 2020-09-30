"use strict";
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require('multer');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const initializePassport = require('./passport-config')
initializePassport(
	passport, 
	getUserByUsername,
	getUserById
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer().none());
app.use(flash());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const SRVER_ERROR_MSG = 'Something went wrong on the server.';

const filterCategory = ["Restaurant and Dining",
						"Driving/Transportation",
						"Technology",
						"Data Plan",
						"Insurance",
						"Electricity"];

/**
  * Serves the login page
  */
app.get('/login', checkNotAuthenticated, (req, res) => {
	res.sendFile(__dirname + '/public/login.html');
});

/**
  * Serves the registration page
  */
app.get('/register', checkNotAuthenticated, (req, res) => {
	res.sendFile(__dirname + '/public/register.html');
});

/**
  * Serves the landing page
  */
app.get('/', checkAuthenticated, (req, res) => {
	res.sendFile(__dirname + '/public');
});

/**
  * Returns the error of the previous login
  */
app.get('/loginerror', (req, res) => {
	res.send(req.flash('error'));
});

/**
  * Returns the username of current login
  */
app.get('/user', async (req, res) => {
	res.send(await req.user)
});

/**
  * Redirects to main page if login is successful, back to login page otherwise
  */
app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: true
}));

/**
  * Registers new username.
  * Redirects to mainpage on success
  * Returns json with message on failure
  */
app.post('/register', async (req, res) => {
	try {
		let db = await getDBConnection();
		let qry = "SELECT uid FROM Users WHERE username=?";
		let result = await db.all(qry, [req.body.username]);

		if (result.length > 0) {
			res.json({message: "Username " + req.body.username + " already exists"});
			return;
		}

		if (req.body.password.length < 6) {
			res.json({message: "Password must be at least 6 characters long."});
			return;
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		qry = "INSERT INTO Users (username, password, currency) VALUES (?, ?, ?)";
		await db.run(qry, [req.body.username, hashedPassword, req.body.currency]);

		res.json({message: "Success"});
	} catch (e) {
		res.type('text');
		res.status(SERVER_ERROR).send(SRVER_ERROR_MSG);
	}
});

/**
  * Input data to spending table for specific user
  */
app.post("/input", checkAuthenticated, async function(req, res) {
	try {
		let db = await getDBConnection();
		let qry = "INSERT INTO Spending (date, spent, description, uid, category) VALUES (?, ?, ?, ?, ?)";
		await db.run(qry, [req.body.date, req.body.amount, req.body.description, req.body.uid, req.body.category]);

		res.type('text');
		res.send("Successfully inserted values");
	} catch (err) {
		res.type('text');
		res.status(SERVER_ERROR).send(SRVER_ERROR_MSG);
	}
});

/**
  * Updates the specified post with new values
  */
app.post('/update', checkAuthenticated, async function(req, res) {
	try {
		let db = await getDBConnection();
		let qry = "UPDATE Spending SET date=?, spent=?, description=? WHERE id=?"
		await db.run(qry, [req.body.date, req.body.amt, req.body.desc, req.body.id]);

		res.type('text');
		res.send('Successfully updated values');
	} catch (e) {
		res.type('text')
		res.status(SERVER_ERROR).send(SRVER_ERROR_MSG);
	}
});

/**
  * Deletes spending entry with specified id
  */
app.post('/delete', checkAuthenticated, async function(req, res) {
	try {
		let db = await getDBConnection();
		let qry = "DELETE FROM Spending WHERE id=?";
		await db.run(qry, [req.body.id]);
		res.type('text');
		res.send('Successfully deleted values');
	} catch (e) {
		res.type('text');
		res.status(SERVER_ERROR).send(SRVER_ERROR_MSG);
	}
});

/**
  * Returns the list of filters
  */
app.get("/filterList", (req, res) => {
	res.json(filterCategory);
});

/**
  * Gets expenses from spending table for a specific user
  */
app.get("/expenses", checkAuthenticated, async function(req, res) {
	try {
		let db = await getDBConnection();
		let qry = "SELECT * FROM Spending WHERE ?=uid AND date BETWEEN ? AND ? ORDER BY date DESC";

		let result = await db.all(qry, [req.query.uid, req.query.start, req.query.end]);
		res.json(result);
	} catch (err) {
		res.type('text');
		res.status(SERVER_ERROR).send(SRVER_ERROR_MSG);
	}
});


/**
  * Logs out and removes user credentials
  */
app.delete('/logout', (req, res) => {
	req.logOut();
	res.redirect('/login');
})

// Util functions

/**
  * Connects JS with the database
  */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "budget.db",
    driver: sqlite3.Database
  });

  return db;
}

/**
  * Redirects to main page if user is authenticated
  */
function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect("/login");
}

/**
  * Redirects to login page if user is not authenticated
  */
function checkNotAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return res.redirect('/');
	}

	next();
}

/**
  * Gets the user info given the username
  * @param {string} username - username used to retrieve info
  */
async function getUserByUsername(username) {
	try {
		let db = await getDBConnection();
		let qry = "SELECT * FROM Users WHERE username=?";
		let result = await db.all(qry, [username]);

		if (result.length != 1) {
			return null;
		} else {
			return result[0];
		}
	} catch {
		return null;
	}
}

/**
  * Gets the user info given the user's id
  * @param {integer} uid - user id used to retrieve info
  */ 
async function getUserById(uid) {
	try {
		let db = await getDBConnection();
		let qry = "SELECT * FROM Users WHERE uid=?";
		let result = await db.all(qry, [uid]);

		if (result.length != 1) {
			return null;
		} else {
			return result[0];
		}
	} catch {
		return null;
	}
}


const PORTNUM = 8000;
app.use(express.static("public"));
const PORT = process.env.PORT || PORTNUM;
app.listen(PORT);