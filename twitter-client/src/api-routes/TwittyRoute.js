
import pkg from 'sqlite3';
const { Database } = pkg;
import { Router } from 'express';
import dotenv from "dotenv"
import Twitter from "twitter"
var router = Router();



// router.get('/', function (req, res) {

//   res.send('Twitty home page');
// })
async function getTweets(request, response) {
  try {
    //Step 1 - Search Tweet
    let searchTweetsResults = await searchTweets();
    //Step 2 - Save the results
    saveTweets(searchTweetsResults).then(result => {
      console.log('Saved');
    });
    //Step 3 - Retreive the saved tweets from DB and send reponse
    let tweetObjArray = [];
    getAllTweets().then(res => {
      tweetObjArray = res;
      response.header("Access-Control-Allow-Origin", "*");
      response.statusCode = 200;
      response.write(JSON.stringify(tweetObjArray));
      response.end();
    });

    /**
     * Retreive the tweets stored
     */
    function getAllTweets() {
      return new Promise((resolve, reject) => {
        const db = new Database('./twitty.db');
        let sql = `SELECT * FROM Tweets`;

        db.all(sql, [], (err, rows) => {
          if (err) { throw err; }
          resolve(rows);
        });
      });
    }


    /**
     * Save the tweets passed to this function
     * to the SQLite Database
     * @param {Array} tweetArray 
     * @returns 
     */
    function saveTweets(tweetArray) {
      try {
        return new Promise((resolve, reject) => {
          console.log("Start inserting " + tweetArray.length + " tweets");
          const sqlliteDB = new Database('./twitty.db', (err) => {
            if (err) {
              console.error("Could not connect to the database " + err.message);
            }

            // Inserting the tweets one by one.However this could be enhanced to do bulk insert
            let sqlInsert = `INSERT INTO Tweets (
                  Tweetid,
                  Tweet,
                  CreatedAt,
                  CreatedBy) VALUES (?,?,?,?)`;
            tweetArray.forEach(tw => {

              sqlliteDB.run(sqlInsert, [tw.id, tw.tweet, tw.createdAt, tw.createdBy], function (error) {
                //Handle error when unique constraint is violated because the tweet already exists.
                if (error && error.code == 'SQLITE_CONSTRAINT') {
                  console.log("Tweet exists " + tw.id);
                }
                else if (error) {
                  console.log(error);
                }
                else {
                  console.log("Last ID: " + this.lastID)
                  console.log("# of Row Changes: " + this.changes)
                }
              });
            });

            sqlliteDB.close((err) => {
              if (err) {
                console.error(err.message);
                throw err;
              }
              console.log('Close the database connection.');
            });
          });
        });
      } catch (error) {
        console.log(error);
      }
    }

    /**
     * Search Tweets with #liveperson using twitter api
     * @returns 
     */
    function searchTweets() {
        return new Promise((resolve, reject) => {
          dotenv.config({ path: '.env' });
          var client = new Twitter({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            bearer_token: process.env.TWITTER_BEARER_TOKEN
          });

          let tweetsArray = [];
          client.get('search/tweets', { q: '#liveperson' }, function (error, tweets, response) {
          tweets.statuses.forEach(function (tweet) {

              let tweetObj = new Object();
              tweetObj.id = tweet.id;
              tweetObj.tweet = tweet.text;
              tweetObj.createdAt = tweet.created_at;
              tweetObj.createdBy = tweet.user.id;
              tweetsArray.push(tweetObj);
              resolve(tweetsArray);
            });

            return tweetsArray;

          });
        });
    }

  } catch (exception) {
    console.log("Error occured:" + exception)
    esponse.header("Access-Control-Allow-Origin", "*");
    response.statusCode = 400;
    response.write(JSON.stringify("Could not retreive Tweets" + exception));
    response.end();

  }

}
export default getTweets;
