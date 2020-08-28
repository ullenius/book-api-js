"use strict";

const BASE = "https://www.forverkliga.se/JavaScript/api/crud.php?";
const requestKeyUrl = `${BASE}requestKey`;
var key;

function init() {

    var app = document.getElementById("app");
    var button = document.getElementById("knapp");
    button.addEventListener("click", viewData);

    key = localStorage.getItem("book-api");

    if (!key) {
        key = fetchKey();
    } else {
        console.log(`Cached key: ${key}`);
        console.log("view url", viewUrl());
    }

}

function viewUrl() {

    var base = authUrl();
    return `${base}&op=select`;
}

function authUrl() {
    return `${BASE}key=${key}`;
}


function viewData() {

    fetch(viewRequest)

    .then( function parseJSON(response) {

        return response.json();
    })

    .then(function printData(data) {

        var {
            status,
            message,
            data : [
                    {
                        id,
                        title,
                        author,
                        updated
                    } = {}
             ] = []
        } = data;

        if (status === "success") {

            console.log(`id: ${id}`);
            console.log(`title: ${title}`);
            console.log(`author: ${author}`);
            console.log(`updated: ${updated}`);
        } else {

            console.log("Failed! ", status);
            console.log("Message: ", message);
        }

    });

}

function fetchKey() {

    fetch(requestKeyUrl)

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
