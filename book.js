"use strict";

const BASE = "https://www.forverkliga.se/JavaScript/api/crud.php?";
const requestKeyUrl = `${BASE}requestKey`;
var key;

function init() {

    var app = document.getElementById("app");
    var button = document.getElementById("knapp");
    button.addEventListener("click", viewData);

    var addButton = document.getElementById("addButton");
    addButton.addEventListener("click", function readInput() {

        var author = document.getElementById("author");
        var title = document.getElementById("title");
        var book = {
            author: author.value,
            title: title.value
        };
        console.log(book);
        addBook(book);
    });

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

function addBook(book) {
    
    var url = addUrl(book);

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

function viewData( { counter : attempts = 1 } ) {

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

            console.log(`Attempts: ${attempts}`);

            displayList(books);
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

            if (attempts <= 10) {
                console.log(`Attempt ${attempts} failed.`);
                console.log("Trying again in 5 seconds");
                attempts = attempts + 1;
                setTimeout(viewData, 5000, { counter: attempts });
            }

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

function displayList(books) {

    var list = document.getElementById("booklist");

    books.forEach(function display(book) {

        var {
            id,
            title,
            author,
            updated
        } = book;

        var li = document.createElement("li");
        var text = document.createTextNode(
        `id: ${id} title: ${title} author: ${author} updated: ${updated}`);
        li.appendChild(text);
        list.appendChild(li);
    });
}

window.onload = init;
