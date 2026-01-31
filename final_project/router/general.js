const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");


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
public_users.get("/async/books", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

public_users.get("/async/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "Book not found" });
  }
});

public_users.get("/async/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const response = await axios.get(
      `http://localhost:5000/author/${encodeURIComponent(author)}`
    );
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

public_users.get("/async/title/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const response = await axios.get(
      `http://localhost:5000/title/${encodeURIComponent(title)}`
    );
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "No books found with this title" });
  }
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
