var fs = require('fs');
var request = require('request');
var json2csv = require('json2csv');

var GOOGLE_SHEET_ID = "1I1ZrlGVFAgaLSvjUxe5BS9QHxD4rAT9vUfqbWad-3L4";
var GOOGLE_SHEET_URL = "https://spreadsheets.google.com/feeds/list/" + GOOGLE_SHEET_ID + "/1/public/basic?alt=json";
var INSTAGRAM_URL = "https://instagram.com/";

var OUTPUT_CSV_FIELDS = [
  'fullName', 'username', 'url', 'bio', 'following', 'averageEngagement',
  'imageURL1', 'imageURL2', 'imageURL3', 'imageURL4', 'imageURL5', 'imageURL6',
];
var OUTPUT_FILENAME = 'output/influencers.csv';

// INFLUENCER REQUIREMENTS
var AVERAGE_ENGAGEMENT_MIN = 300;

// The setInterval interval id
var intervalId = null;

var userProfileURLs = [];
var userProfileCount = 0;
var userProfileDatas = [];

// This function sets the requirements for an account to be an influencer
var isInfluencer = function (userData) {
  if (userData.averageEngagement >= AVERAGE_ENGAGEMENT_MIN) return true;

  return false;
};

var calculateAverageEngagement = function (recentPosts) {
  var totalLikes = recentPosts.reduce(function (total, post) {
    return total + post["likes"]["count"];
  }, 0);

  return Math.round(totalLikes / recentPosts.length);
};

var parseUserProfile = function (pageSource) {
  shards = pageSource.split('window._sharedData = ');
  instaJSON = shards[1].split(';</script>');
  instaArray = JSON.parse(instaJSON[0]);
  return instaArray;
};

var scrapingLoop = function () {
  if (!userProfileURLs.length) {
    console.log('Finishing up...');

    // Wait 5 seconds before writing file
    setTimeout(function () {
      // Save data to CSV file
      var csv = json2csv({ data: userProfileDatas, fields: OUTPUT_CSV_FIELDS });

      fs.writeFile(OUTPUT_FILENAME, csv, function(err) {
        if(err) return console.error(err);
        console.log("Done.");
      });
    }, 5000);

    return clearInterval(intervalId);
  }

  var userURL = userProfileURLs.pop();
  var index = userProfileCount - userProfileURLs.length;

  request(userURL, function (err, response, body) {
    if (err) return console.error(err);
    if (response.statusCode === 404) {
      return console.log(index + "/" + userProfileCount + " - Not found: " + userURL);
    }

    var data = parseUserProfile(body);
    var userData = data['entry_data']['ProfilePage'][0]['user'];
    var recentPosts = userData['media']['nodes'];
    var followingCount = userData['followed_by']['count'];
    var bio = userData['biography'];
    var fullName = userData['full_name'];
    var username = userData['username'];
    var imageURLs = recentPosts.map(function (post, index) {
      return post["thumbnail_src"];
    });

    var userData = {
      fullName: fullName,
      username: username,
      url: userURL,
      bio: bio,
      following: followingCount,
      imageURL1: imageURLs[0],
      imageURL2: imageURLs[1],
      imageURL3: imageURLs[2],
      imageURL4: imageURLs[3],
      imageURL5: imageURLs[4],
      imageURL6: imageURLs[5],
      averageEngagement: calculateAverageEngagement(recentPosts),
    };

    if (isInfluencer(userData)) {
      console.log(index + "/" + userProfileCount + " - Winner winner! - Engagement: " + userData.averageEngagement + " - " + userData.url);
      userProfileDatas.push(userData);
    } else {
      console.log(index + "/" + userProfileCount + " - Response: " + response.statusCode + " - " + userURL);
    }
  });
};

request(GOOGLE_SHEET_URL, function (err, response, body) {
  if (err) return console.error(err);

  var data = JSON.parse(body);
  userProfileURLs = data["feed"]["entry"].map(function (entry) {
    return INSTAGRAM_URL + entry["title"]["$t"];
  });
  userProfileCount = userProfileURLs.length;

  intervalId = setInterval(scrapingLoop, 1000);
});
