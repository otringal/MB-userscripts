// ==UserScript==
// @name          Musicbrainz: Compare AcoustIDs easier!
// @description   Displays AcoustID fingerprints in more places at MusicBrainz.
// @grant         none
// @include       *://musicbrainz.org/artist/*/recordings*
// @include       *://musicbrainz.org/release/*
// @exclude       *://musicbrainz.org/release/*/*
// @include       *://musicbrainz.org/recording/*
// @include       *://musicbrainz.org/recording/merge*
// @include       *://*.musicbrainz.org/artist/*/recordings*
// @include       *://*.musicbrainz.org/release/*
// @exclude       *://*.musicbrainz.org/release/*/*
// @include       *://*.musicbrainz.org/recording/*
// @include       *://*.musicbrainz.org/recording/merge*
// @include       *://*.musicbrainz.org/search/*
// @include       *://musicbrainz.org/search/*
// @include       *://*.musicbrainz.org/edit/*
// @include       *://musicbrainz.org/edit/*
// @include       *://*musicbrainz.org/artist/*/open_edits
// @include       *://musicbrainz.org/artist/*/open_edits
// @include       *://*.musicbrainz.org/user/*
// @include       *://musicbrainz.org/user/*
// ==/UserScript==
//
//	This script is copy/pasted together (literally) from the following two scripts:
//	* https://bitbucket.org/acoustid/musicbrainz-acoustid
//	* http://userscripts.org/scripts/show/176866 by th1rtyf0ur
//
function acoustid() {
  function extractRecordingMBID(link) {
    if (link !== undefined) {
      var parts = link.href.split('/');
      console.log(parts[3]);
      if (parts[3] == 'recording') {
        return parts[4]; //return MBID
      }
    }
  }
  function findAcoustIDsByMBIDsInternal(mbids, result, callback) {
    var remaining_mbids = [
    ];
    if (mbids.length > 50) {
      remaining_mbids = mbids.slice(50);
      mbids = mbids.slice(0, 50);
    }
    $.ajax({
      url: '//api.acoustid.org/v2/track/list_by_mbid?format=jsonp&batch=1&jsoncallback=?',
      dataType: 'json',
      data: {
        'mbid': mbids
      },
      traditional: true,
      success: function (json) {
        for (var i = 0; i < json.mbids.length; i++) {
          result.mbids.push(json.mbids[i]);
        }
        if (remaining_mbids.length > 0) {
          findAcoustIDsByMBIDsInternal(remaining_mbids, result, callback);
        } 
        else {
          callback(result);
        }
      }
    });
  }
  function findAcoustIDsByMBIDs(mbids, callback) {
    if (mbids.length == 0) {
      return;
    }
    var result = {
      'mbids': [
      ]
    }
    findAcoustIDsByMBIDsInternal(mbids, result, callback);
  }
  function updateArtistRecordingsPage() {
    var mbids = [
    ];
    $('.tbl tr td:nth-child(2) a').each(function (i, link) {
      var mbid = extractRecordingMBID(link);
      if (mbid !== undefined) {
        mbids.push(mbid);
      }
    });
    if (mbids.length == 0) {
      return;
    }
    findAcoustIDsByMBIDs(mbids, function (json) {
      var has_acoustids = {
      };
      for (var i = 0; i < json.mbids.length; i++) {
        has_acoustids[json.mbids[i].mbid] = json.mbids[i].tracks.length > 0;
      }
      $('.tbl tr td:nth-child(2)').each(function (i, td) {
        var mbidtocheck = extractRecordingMBID($(td).find('a').get(0));
        if (mbidtocheck === undefined) {
          return;
        }
        if (has_acoustids[mbidtocheck]) {
          //ADD acoustid id img + hover over img acoustid comparison								
          for (var b = 0; b < json.mbids.length; b++) {
            if (json.mbids[b].mbid == mbidtocheck) {
              $.each(json.mbids[b].tracks, function () {
                var a = $('<a href="#"><img src="//acoustid.org/static/acoustid-wave-12.png" title="' + this.id + '" alt="AcoustID" /></a>');
                a.attr('href', '//acoustid.org/track/' + this.id);
                a.css({
                  'float': 'right'
                });
                $(td).find('a:first').after(a);
              });
            }
          }
        }
      });
    });
  }
  // Adds Acoustid to merge recordings edits

  function updateMergeOrEdits(check, path) {
    var mbids = [
    ];
    if (check) var numb = 0;
     else var numb = 1;
    if (path.match(/edit/)) $('.details.merge-recordings thead tr th:nth-child(' + (4 - numb) + ')').after('<th>AcoustIDs</th>');
    else if (path.match(/recording\/merge/)) $('.tbl thead tr th:nth-child(' + (4 - numb) + ')').after('<th>AcoustIDs</th>');
    $('.tbl tr td:nth-child(' + (3 - numb) + ') a').each(function (i, link) {
      var mbid = extractRecordingMBID(link);
      if (mbid !== undefined) {
        mbids.push(mbid);
      }
    });
    if (mbids.length == 0) {
      return;
    }
    findAcoustIDsByMBIDs(mbids, function (json) {
      var has_acoustids = {
      };
      for (var i = 0; i < json.mbids.length; i++) {
        has_acoustids[json.mbids[i].mbid] = json.mbids[i].tracks.length > 0;
      }
      $('.tbl tr td:nth-child(' + (3 - numb) + ')').each(function (i, td) { //for each recording get mbid
        var tdRef = $(td).first().next();
        var mbidtocheck = extractRecordingMBID($(td).find('a').get(0));
        if (mbidtocheck === undefined) {
          return
        }
        if (has_acoustids[mbidtocheck]) {
          var newtd = '<td>';
          for (var b = 0; b < json.mbids.length; b++) {
            if (json.mbids[b].mbid == mbidtocheck) {
              $.each(json.mbids[b].tracks, function () {
                newtd += '<a href="http://acoustid.org/track/' + this.id + '"><code>' + this.id + '</code></a><br/>';
              });
              newtd += '</td>';
            }
          }
          $(tdRef).after(newtd);
        } 
        else $(tdRef).after('<td></td>');
      });
    });
  }
  function updatePages(path) {
    if (path.match(/artist\/[A-Fa-f0-9-]+\/recordings/) || path.match(/release\/[A-Fa-f0-9-]+/)) {
      updateArtistRecordingsPage();
      return;
    } 
    else if (path.match(/recording\/merge/) || path.match(/edit/)) {
      if (path.match(/recording\/merge/)) var check = true;
       else var check = false;
      updateMergeOrEdits(check, path);
      return;
    }
  }
  updatePages(window.location.href);
}
var script = document.createElement('script');
script.appendChild(document.createTextNode('(' + acoustid + ')();'));
document.body.appendChild(script);
