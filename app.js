"use strict";

const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require('multer');
app.use(multer().none());

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const SRVER_ERROR_MSG = 'Something went wrong on the server.';

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

app.post("/input", async function(req, res) {
	try {
		let db = await getDBConnection();
		let qry = "INSERT INTO Spending (date, spent, description) VALUES (?, ?, ?)";
		await db.run(qry, [req.body.date, req.body.amount, req.body.description]);

		res.type('text');
		res.send("Successfully inserted values");
	} catch (err) {
		res.type('text');
		res.status(SERVER_ERROR).send(SRVER_ERROR_MSG);
	}
});

app.get("/expenses", async function(req, res) {
	try {
		let db = await getDBConnection();
		let qry = "SELECT * FROM Spending WHERE date BETWEEN ? AND ? ORDER BY date DESC";

		let result = await db.all(qry, [req.query.start, req.query.end]);
		res.json(result);
	} catch (err) {
		res.type('text');
		res.status(SERVER_ERROR).send(SRVER_ERROR_MSG);
	}
});

const PORTNUM = 8000;
app.use(express.static("public"));
const PORT = process.env.PORT || PORTNUM;
app.listen(PORT);