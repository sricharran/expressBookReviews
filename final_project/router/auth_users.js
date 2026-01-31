const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return !users.some((u) => u.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some((u) => u.username === username && u.password === password);
};


regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // check credentials
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // generate JWT
  let accessToken = jwt.sign(
    { username: username },
    "fingerprint_customer",
    { expiresIn: 60 * 60 } // 1 hour
  );

  // save JWT in session
  req.session.authorization = {
    accessToken: accessToken,
    username: username
  };

  return res.status(200).json({
    message: "Login successful",
    token: accessToken
  });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.user?.username; // ✅ from JWT

  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.user?.username; // ✅ from JWT

  if (!username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  // delete only the logged-in user's review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
