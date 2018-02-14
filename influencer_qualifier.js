$(document).ready(function () {
  var INFLUENCERS_PER_PAGE = 20;

  var influencerData = [];
  var influencerIndex = 0;

  var $influencerCSVFileInput = $("#influencer-csv-file");
  var $influencerList = $("#influencer-list");
  var $loadMoreButton = $("#load-more-button");
  var $exportApprovedButton = $("#export-approved-influencers");
  var $exportApprovedTextarea = $("#export-approved-influencers-textarea");

  var renderNextInfluencers = function () {
    if (influencerIndex >= influencerData.length) return $influencerList.empty();

    var endIndex = influencerIndex + INFLUENCERS_PER_PAGE;
    var influencersToRender = influencerData.slice(influencerIndex, endIndex)

    $influencerList.empty();

    for (var i = 0; i < influencersToRender.length; i++) {
      var influencer = influencersToRender[i];
      var imagesElements = [];
      var currentInfluencerIndex = influencerIndex + i;

      for (var j = 1; j <= 6; j++) {
        imagesElements.push("<img src='" + influencer["imageURL" + j] + "'>");
      }

      $influencerList.append([
        "<div class='influencer' data-index='" + currentInfluencerIndex + "'>",
          "<a href='" + influencer["url"] + "'>",
            "<h3>",
              influencer["fullName"] + "(@" + influencer["username"] + ")",
            "</h3>",
          "</a>",
          "<p><b>",
            influencer["following"] + " Followers ",
            "(" + influencer["averageEngagement"] + " Average Likes)",
          "</b></p>",
          "<p class='bio'>" + influencer["bio"] + "</p>",
          imagesElements.join(""),
          "<br>",
          "<button class='approve'>Approve</button> ",
          "<button class='disapprove'>Disapprove</button>",
        "</div>",
      ].join(""));
    }

    influencerIndex = endIndex;
  };

  $influencerList.delegate('.approve', "click", function (e) {
    var $influencer = $(e.currentTarget.parentNode);
    $influencer.remove();

    if (!$influencerList.children().length) renderNextInfluencers();
  });

  $influencerList.delegate('.disapprove', "click", function (e) {
    var $influencer = $(e.currentTarget.parentNode);
    var indexToRemove = $influencer.attr('data-index');

    influencerData[indexToRemove] = null;
    $influencer.remove();

    if (!$influencerList.children().length) renderNextInfluencers();
  });

  $loadMoreButton.click(function (e) {
    e.preventDefault();
    renderNextInfluencers();
  });

  $exportApprovedButton.click(function (e) {
    var output = influencerData.filter(function (data) {
      return data !== null;
    }).map(function (data) {
      var keys = Object.keys(data);
      var s = "";

      for (var i = 0; i < keys.length; i++) {
        console.log(keys[i]);
        if (keys[i].includes("imageURL")) continue;
        if (keys[i].includes("bio")) continue;
        if (keys[i].includes("username")) continue;

        s += data[keys[i]] + "\t";
      }

      return s;
    }).join("\n");

    e.preventDefault();

    $exportApprovedTextarea.val(output);
  });

  $influencerCSVFileInput.change(function (e) {
    // Update data store and rerender
    Papa.parse($influencerCSVFileInput[0].files[0], {
      header: true,
      complete: function (results) {
        influencerData = results.data;
        renderNextInfluencers();
      }
    });
  });
});
