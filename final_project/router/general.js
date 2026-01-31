const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // missing fields
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  // username already exists
  if (!isValid(username)) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  // register
  users.push({ username: username, password: password });

  return res.status(201).json({
    message: "User successfully registered"
  });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    if (books) resolve(books);
    else reject("No books available");
  });

  getBooks
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((err) => res.status(500).json({ message: err }));
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject("Book not found");
  });

  getBookByISBN
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});


  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let result = [];

    keys.forEach((key) => {
      if (books[key].author === author) {
        result.push({ isbn: key, ...books[key] });
      }
    });

    if (result.length > 0) resolve(result);
    else reject("No books found for this author");
  });

  getBooksByAuthor
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});



// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    const keys = Object.keys(books);
    let result = [];

    keys.forEach((key) => {
      if (books[key].title === title) {
        result.push({ isbn: key, ...books[key] });
      }
    });

    if (result.length > 0) resolve(result);
    else reject("No books found with this title");
  });

  getBooksByTitle
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((err) => res.status(404).json({ message: err }));
});



//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }

  return res.status(404).json({ message: "Book not found" });
});


module.exports.general = public_users;
