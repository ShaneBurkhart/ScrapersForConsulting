// Paste into developer console in chrome
var s = $;
var clipboard = copy;
var intervalId = setInterval(function () {
  var loadMore = s('._m3m1c');

  if (!loadMore) {
    var o = {};
    var usernames = document.getElementsByClassName('_2g7d5');

    for (var i = 0; i < usernames.length; i++) {
      var u = usernames[i];
      u.style.color = "#ffffff";
      o[u.text] = 1;
    }
    var keysJSONString = JSON.stringify(Object.keys(o));
    var output = keysJSONString.replace(/(\[\"|\"\])/g, "").replace(/\",\"/g, "\n");
    clipboard(output);
    console.log("Done.");

    return clearInterval(intervalId);
  }

  console.log("click");
  loadMore.click();
}, 75);
