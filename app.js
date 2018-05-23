var sqlite3 = require('sqlite3').verbose();
const express = require('express');
const postsRoutes = require('./posts_rotes');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use('/api/posts', postsRoutes);

// Initialize DB
const DB_FILE = './simple_blog.sqlite';
const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) throw err;

  //Test if comments table exists - if not create it
  let result = db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?;`, ['posts']);
  
  console.log(result);
  
  if (!result) {
    db.run(`CREATE TABLE posts (id INTEGER PRIMARY KEY, author TEXT, text TEXT);`)
      .then(() =>
        console.log(`Table "posts" successfully created in db: ${DB_FILE}`)
      );
  }
  console.log(`Successfully connected to SQLite server`);

  //Add db as app local property
  app.locals.db = db;

  //Start the server
  app.listen(9000, (err) => {
    if (err) throw err;
    console.log('Express app listening on port 9000!')
  });
});