"use strict";

const BASE = "https://www.forverkliga.se/JavaScript/api/crud.php?requestKey";
var key;

function init() {

    var app = document.getElementById("app");
    var key = localStorage.getItem("book-api");

    if (!key) {
        key = fetchKey();
    } else {
        console.log(`Cached key: ${key}`);
    }

}

function fetchKey() {

    fetch(BASE)

    .then( function parseJSON(response) {

        return response.json();

    }).then(function print(data) {

        var {
            status,
            key
        } = data;

        console.log("status ", status);
        if (status === "success") {
            localStorage.setItem("book-api", key);
            console.log(key);
            return key;
        }
    });

}


window.onload = init;
