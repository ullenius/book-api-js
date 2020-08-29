"use strict";

const BASE = "https://www.forverkliga.se/JavaScript/api/crud.php?";
const requestKeyUrl = `${BASE}requestKey`;
var key;

function init() {

    var app = document.getElementById("app");
    var button = document.getElementById("knapp");
    button.addEventListener("click", viewData);

    var removeButton = document.getElementById("removeButton");
    removeButton.addEventListener("click", function remove() {
        var id = document.getElementById("remove").value;
        if (id) {
            id = Number(id);
            removeBook( { id } );
        }
    });

    var addButton = document.getElementById("addButton");
    addButton.addEventListener("click", function readInput() {

        var author = document.getElementById("author");
        var title = document.getElementById("title");
        var book = {
            author: author.value,
            title: title.value
        };
        console.log(book);
        addBook( { book } );
    });

    var updateButton = document.getElementById("update");
    updateButton.addEventListener("click", function readInput() {
        var author = document.getElementById("author");
        var title = document.getElementById("title");
        var id = document.getElementById("remove");

        id = id.value.trim();
        if (id.length === 0 ) {
            alert("Id field required!");
        }

        var book = {
            id: id.value,
            author: author.value,
            title: title.value
        };
        console.log(book);
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

function removeUrl(id) {
    var base = authUrl();
    return `${base}&op=delete&id=${id}`;
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

function addBook( { counter: attempts = 1, book } ) {

    console.log(`addBook... counter = ${attempts} book = ${book}`);
    
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
            console.log("Failed! ", status);
            console.log("Message: ", message);
            retry( { func: addBook, attempts, book } );
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
            retry( { func : viewData, attempts } );
        }
    });
}

function removeBook({ counter : attempts = 1, id } ) {

    const url = removeUrl(id);

    console.log("url ", url);
    fetch(url)

    .then( function parseJSON(response) {

        return response.json();
    })

    .then(function printData(data) {

        var {
            status,
            message
            } = data;
        if (status === "success") {
            console.log(`Attempts: ${attempts}`);
            console.log(`Successfully deleted ${id}`);
        } else {
            console.log("Failed! ", status);
            console.log("Message: ", message);
            retry( { func : removeBook, attempts, id } );
        }
    });
}

function retry({
    attempts,
    func,
    book,
    id
    } ) {
    const DELAY = 5000;

        if (attempts <= 10) {
           console.log(`Attempt ${attempts} failed.`);
           console.log(`Trying again in ${DELAY/1000} seconds`);
           attempts = attempts + 1;
           setTimeout(func, DELAY, { counter: attempts, book, id });
        }
}

function fetchKey( { counter: attempts = 1 } ) {

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
        } else {
            console.log("Failed! ", status);
            console.log("Message: ", message);
            retry( { func : fetchKey, attempts } );
        }

    });

}

function displayList(books) {

    var list = document.getElementById("booklist");
    list.innerHTML = "";

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
