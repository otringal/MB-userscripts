// ==UserScript==
// @name          Musicbrainz: Ultimate list destroyer
// @version       2019.10.18
// @description   Hide/show very long work and/or country lists
// @namespace     https://github.com/otringal/MB-userscripts
// @grant         none
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @include       *://*musicbrainz.org/artist/*/works*
// @include       *://*musicbrainz.org/release/*
// @include       *://*musicbrainz.org/release-group/*
// @include       *://*musicbrainz.org/artist/*/releases*
// @include       *://*musicbrainz.org/label/*
// @run-at        document-end
// ==/UserScript==
//
/*----/ USER SETTINGS /----*/
var removeWorksArtist = true; //set to "true" to enable "show/hide works", "false" to disable.
var removeCountries = true; //set to "true" to enable "show/hide countries", "false" to disable.
var alwaysShowWorks = 5; //the minimum number of work ACs that always are shown on the artist/works page. Must be higher than 0.
var alwaysShowCountries = 5; //same as above but for countries
//var removeWorksRelease = false; //change this to "false" to display translated works rels, etc, on the release page
/*----/ USER SETTINGS /----*/

var showcss = document.createElement("style");
    showcss.type = "text/css";
    showcss.innerHTML = ".hidelist {display:none;} .showworks span {white-space: nowrap; margin: 0.4em 0em; padding: 0.1em 0.3em; font-size: smaller; text-transform: uppercase; font-weight: 600; background-color: rgba(250, 200, 35, 0.5); cursor: pointer;}";
    document.body.appendChild(showcss);

var url = window.location.href;
var listpath = "";
var listpath2 = "";
var hiddenlength = 0;

if (removeWorksArtist && url.match(/works/) && alwaysShowWorks !=0) {
    listpath = $(".tbl tr td:nth-last-child(6) ul");
    $(listpath).each(function(){
        if ($(this).find("li").length > alwaysShowWorks){
            hiddenlength = $(this).find("li").length - alwaysShowWorks;
            $(this).find("li:gt("+(alwaysShowWorks-1)+")").addClass("hidelist").hide().end().prepend("<li class='showworks allworks'><span>show all (+"+hiddenlength+")</span></li>");
        }
    });
    showhide();
}

else if (removeCountries && alwaysShowCountries !=0 && url.match(/(release\/)/)) {
    listpath = $(".release-events").next();
    $(listpath).each(function(){
        if ($(this).find("li").length > alwaysShowCountries){
            hiddenlength = $(this).find("li").length - alwaysShowCountries;
            $(this).find("li:gt("+(alwaysShowCountries-1)+")").addClass("hidelist").hide().end().prepend("<li class='showworks allworks'><span>show all (+"+hiddenlength+")</span></li>");
        }
    });
    showhide();
}

else if (removeCountries && alwaysShowCountries !=0 && (url.match(/release-group/) || url.match(/(artist).+(releases)/) || url.match(/label/) )) {
    if (url.match(/release-group/)){
        listpath = $(".tbl tr td:nth-last-child(4) ul");
        listpath2 = $(".tbl tr td:nth-last-child(5) ul");
    }
    else if (url.match(/(artist).+(releases)/)){
        listpath = $(".tbl tr td:nth-last-child(4) ul");
        listpath2 = $(".tbl tr td:nth-last-child(5) ul");
    }
    else if (url.match(/label/)){
        listpath = $(".tbl tr td:nth-last-child(3) ul");
        listpath2 = $(".tbl tr td:nth-last-child(4) ul");
    }

    $(listpath).each(function(){
        if ($(this).find("li").length > alwaysShowCountries){
            hiddenlength = $(this).find("li").length - alwaysShowCountries;
            $(this).find("li:gt("+(alwaysShowCountries-1)+")").addClass("hidelist").hide().end().prepend("<li class='showworks allworks'><span>show all (+"+hiddenlength+")</span></li>");
        }
    });
    $(listpath2).each(function(){
        if ($(this).find("li").length > alwaysShowCountries){
            hiddenlength = $(this).find("li").length - alwaysShowCountries;
            //no "show all" button, since most examples i've seen all have the same date.
            $(this).find("li:gt("+(alwaysShowCountries-1)+")").hide().end().prepend("<li><span style='margin: 0.4em 0em; padding: 0.1em 0.3em;'></span></li>");
        }
    });
    showhide();
}

function showhide(){
    $(".showworks").on("click", function(){
        $(this).parent().children('.hidelist').toggle();
        if($(this).hasClass("allworks")){
           $(this).addClass("lessworks").removeClass("allworks").children(0).html("show less");
        }
        else if($(this).hasClass("lessworks")){
            hiddenlength = $(this).parent().children('.hidelist').length+1;
            $(this).addClass("allworks").removeClass("lessworks").children(0).html("show all (+"+(hiddenlength-1)+")");
        }
    });
}
