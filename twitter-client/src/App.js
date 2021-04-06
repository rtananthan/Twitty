
import express from 'express';
import pkg from 'sqlite3';
import tweets from './api-routes/TwittyRoute.js';


const { Database } = pkg;
const app = express();

/**
 * Create SQLite Database of it doesnt exist. Also make sure the Tweets table exists.
 */
const sqlliteDB = new Database('./twitty.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    const sql = `CREATE TABLE IF NOT EXISTS Tweets (
      Tweetid INTEGER PRIMARY KEY,
      Tweet TEXT,
      CreatedAt TEXT,
      CreatedBy TEXT)`;
    sqlliteDB.run(sql);
    console.log('Connected to the twitty.db database.');
});

// Make sure to close the connection with database
sqlliteDB.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Close the database connection.');
});




app.use('/', tweets);
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

