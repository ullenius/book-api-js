"use strict";

const BASE = "http://localhost:8080/?";
const requestKeyUrl = `${BASE}requestKey`;
const API_KEY = "book-api";
var MAX_ATTEMPTS = 10;

function init() {
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

    var key = loadCachedKey();

    if (!key) {
        fetchKey();
    } else {
        console.log(`Cached key: ${key}`);
    }
}

function loadCachedKey() {
    var cache = localStorage.getItem(API_KEY);
    return cache;
}

function viewUrl() {
    var base = authUrl();
    return `${base}&op=select`;
}

function authUrl() {
    var key = loadCachedKey();
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

async function addBook( { counter: attempts = 1, book } ) {
    var url = addUrl(book);
    var response = await fetch(url)
    var data = await parseJson(response);

    var {
        status,
        id,
        message,
    } = data;

    if (status === "success") { // FIXME DRY
        console.log("debug: ", data);
        displayMessage( { message: id, status, attempts } );
    }
    else {
        displayMessage( { message, status, attempts } );
        retry( { func: addBook, attempts, book } );
    }
}

async function updateBook( { counter: attempts = 1, book } ) {
    var url = updateUrl(book);
    var response = await fetch(url);
    var data = await parseJson(response);

    var {
        status,
        message
    } = data || {};
    if (status === "success") { // FIXME DRY
        displayMessage( { status, attempts } );
    }
    else {
        displayMessage( { message, status, attempts } );
        retry( { func: updateBook, attempts, book } );
    }
}

async function viewData( { counter : attempts = 1 } ) {
    var url = viewUrl();
    var response = await fetch(url);
    var data = await parseJson(response);

    var {
        status,
        message = "",
        attempts
    } = data || {};
    console.log("viewData: ", data);
    displayMessage( { 
        status,
        message,
        attempts }
    );

    if ( isSuccessful(data) ) { // FIXME DRY
        var { data : books = [] } = data;
        displayList(books);
    }
    else {
        retry( { func : viewData, attempts } );
    }
}

async function removeBook({ counter : attempts = 1, id } ) {
    var url = removeUrl(id);
    var response = await fetch(url);
    var data = await parseJson(response);

    var {
        status,
        message
    } = data;
    if ( isSuccessful(status) ) {
        displayMessage( { status, message: `Deleted ${id}`, attempts } );
    } else {
        displayMessage( { status: data.status, message : data.message, attempts: attempts } );
        retry( { func : removeBook, attempts, id } );
    }
}

function isSuccessful( { status } = data || {} ) {
    return status == "success";
}

function retry({
    attempts,
    func,
    book,
    id
    } ) {
        const DELAY = 5000;
        if (attempts <= MAX_ATTEMPTS) {
           attempts = attempts + 1;
           setTimeout(func, DELAY, { counter: attempts, book, id } );
        }
}

function fetchKey({
    counter: attempts = 1
    } = {} ) {

    fetch(requestKeyUrl)
    .then(parseJson)
    .then(function print(data) {

        var {
            status,
            message,
            key
        } = data;

        displayMessage( { status } );
        if (status === "success") {
            console.log("successful key fetch... ", key);
            localStorage.setItem(API_KEY, key);
        } else {
            displayMessage( { status, message, attempts } );
            retry( { func : fetchKey, attempts } );
        }

    });
}

function parseJson( response ) {
    return response.json();
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
    attemptBox.textContent = `${attempts}/${MAX_ATTEMPTS}`;
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
