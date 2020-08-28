"use strict";

const BASE = "https://www.forverkliga.se/JavaScript/api/crud.php?";
const requestKeyUrl = `${BASE}requestKey`;
var key;

function init() {

    var app = document.getElementById("app");
    var button = document.getElementById("knapp");
    button.addEventListener("click", viewData);

    var addButton = document.getElementById("addButton");
    addButton.addEventListener("click", addBook);

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

function addUrl({
    title,
    author } ) {
    
    title = encodeURIComponent(title);
    author = encodeURIComponent(author);
    console.log(title);
    console.log(author);

    var base = authUrl();
    return `${base}&op=insert&title=${title}&author=${author}`;
}

function addBook() {
    
    var url = addUrl(
        {
            title : "Röda Rummet",
            author: "Strindberg"
        });

    console.log("url: ", url);

    fetch(url)

    .then( function parseJSON(response) {

        return response.json();
    })

    .then(function printResponse(data) {

        var {
            status,
            id,
            message,
        } = data;

        if (status === "success") {

            console.log(`status: ${status}`);
            console.log(`id: ${id}`);
        }
        else {
            console.log("Fail :(", message);
        }
    });
}

function viewData() {

    const url = viewUrl();

    fetch(url)

    .then( function parseJSON(response) {

        return response.json();
    })

    .then(function printData(data) {

        var {
            status,
            message,
            data : books = []
        } = data;

        if (status === "success") {

            console.log("Length of books array: ", books.length);
            books.forEach( function print(book) {

                var keys = Object.keys(book);
                keys.forEach(function display(key) {
                    console.log(`${key}: ${book[key]}`);
                });
            });
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
