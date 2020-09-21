"use strict";

const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

const INVALID_PARAM_ERROR = 400;
const SERVER_ERROR = 500;
const SRVER_ERROR_MSG = 'Something went wrong on the server.';

/**
 * Connects JS with the database
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: "bestreads.db",
    driver: sqlite3.Database
  });

  return db;
}

const PORTNUM = 8000;
app.use(express.static("public"));
const PORT = process.env.PORT || PORTNUM;
app.listen(PORT);