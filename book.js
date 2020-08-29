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
            id: id,
            author: author.value,
            title: title.value
        };
        updateBook( { book } );
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
    var base = authUrl();

    return `${base}&op=insert&title=${title}&author=${author}`;
}

function updateUrl({
    id,
    title,
    author } ) {

    title = encodeURIComponent(title);
    author = encodeURIComponent(author);
    var base = authUrl();
    return `${base}&op=update&id=${id}&title=${title}&author=${author}`;
}

function addBook( { counter: attempts = 1, book } ) {

    var url = addUrl(book);

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
            displayMessage( { message: id, status, attempts } );
        }
        else {
            displayMessage( { message, status, attempts } );
            retry( { func: addBook, attempts, book } );
        }
    });
}

function updateBook( { counter: attempts = 1, book } ) {
    var url = updateUrl(book);

    fetch(url)
    .then( function parseJSON(response) {
        return response.json();
    })
    .then(function printResponse(data) {
        var {
            status,
            message
        } = data;

        if (status === "success") {
            displayMessage( { status, attempts } );
        }
        else {
            displayMessage( { message, status, attempts } );
            retry( { func: updateBook, attempts, book } );
        }
    });
}

function viewData( { counter : attempts = 1 } ) {

    var url = viewUrl();

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
            displayMessage( { status, attempts } );
            displayList(books);
        } else {
            displayMessage( { status, message, attempts } );
            retry( { func : viewData, attempts } );
        }
    });
}

function removeBook({ counter : attempts = 1, id } ) {

    var url = removeUrl(id);

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
            displayMessage( { status, message: `Deleted ${id}`, attempts } );
        } else {
            displayMessage( { status, message, attempts } );
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
           attempts = attempts + 1;
           setTimeout(func, DELAY, { counter: attempts, book, id } );
        }
}

function fetchKey( { counter: attempts = 1 } ) {

    fetch(requestKeyUrl)

    .then( function parseJSON(response) {
        return response.json();
        })
    .then(function print(data) {

        var {
            status,
            key
        } = data;

        displayMessage( { status } );
        if (status === "success") {
            localStorage.setItem("book-api", key);
            return key;
        } else {
            displayMessage( { status, message } );
            retry( { func : fetchKey, attempts } );
        }

    });
}

function displayMessage({
    attempts : attempts = "",
    status: status = "",
    message: message = "" } ) {

    var statusBox = document.getElementById("status");
    var messageBox = document.getElementById("message");
    var attemptBox = document.getElementById("attempts");

    statusBox.textContent = status;
    messageBox.textContent = message;
    attemptBox.textContent = attempts;
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
