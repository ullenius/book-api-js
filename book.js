"use strict";

const BASE = "https://www.forverkliga.se/JavaScript/api/crud.php?requestKey";
var key;

function init() {

    var app = document.getElementById("app");

    fetch(BASE)

    .then( function parseJSON(response) {

        return response.json();

    }).then(function print(data) {

        console.log(data);
    });

}

window.onload = init;
