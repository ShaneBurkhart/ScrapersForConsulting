// Paste into developer console in chrome
var NUM_POSTS_TO_SCRAPE = 12;
var s = $;
var clipboard = copy;
var dataChunks = [];

var $postLinks = document.getElementsByClassName("_mck9w");
var postIndex = 0;

var scrapeComments = function (callback) {
  var intervalId = setInterval(function () {
    var loadMore = s('._m3m1c');

    if (!loadMore) {
      var o = {};
      var usernames = document.getElementsByClassName('_2g7d5');

      // Stop interval
      clearInterval(intervalId)

      for (var i = 0; i < usernames.length; i++) {
        var u = usernames[i];
        u.style.color = "#ffffff";
        o[u.text] = 1;
      }

      var keysJSONString = JSON.stringify(Object.keys(o));
      var output = keysJSONString.replace(/(\[\"|\"\])/g, "").replace(/\",\"/g, "\n");

      dataChunks.push(output);

      return callback();
    }

    console.log("click");
    loadMore.click();
  }, 75);
};

var openImage = function (index, callback) {
  $postLinks[index].childNodes[0].click();
  console.log("Opening image " + index);
  setTimeout(callback, 1000);
};

var closeImage = function (callback) {
  document.getElementsByClassName("_dcj9f")[0].click();
  console.log("Closing image");
  setTimeout(callback, 100);
};

var loop = function () {
  if (postIndex >= $postLinks.length || postIndex >= NUM_POSTS_TO_SCRAPE) {
    clipboard(dataChunks.join("\n"));
    console.log('Done.');
    return;
  }

  openImage(postIndex, function () {
    scrapeComments(function () {
      closeImage(function () {
        postIndex++;
        loop();
      });
    });
  });
};

loop();
