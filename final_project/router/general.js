const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ==================== Task 7: Register ====================
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ==================== Basic Routes ====================

// Get all books
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get books by author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let booksbyauthor = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author === author) {
      booksbyauthor.push({
        "isbn": isbn,
        "author": books[isbn].author,
        "title": books[isbn].title,
        "reviews": books[isbn].reviews
      });
    }
  });

  res.send(JSON.stringify({ booksbyauthor }, null, 4));
});

// Get books by title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let booksbytitle = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title === title) {
      booksbytitle.push({
        "isbn": isbn,
        "author": books[isbn].author,
        "title": books[isbn].title,
        "reviews": books[isbn].reviews
      });
    }
  });

  res.send(JSON.stringify({ booksbytitle }, null, 4));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// ==================== Task 10-13: Using Axios + Promise / async-await ====================

// Task 10: Get all books using async-await with Axios
public_users.get('/async', async function (req, res) {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error occurred while fetching books" });
  }
});

// Task 11: Get book details based on ISBN using Promise callbacks with Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(function (response) {
      return res.status(200).json(response.data);
    })
    .catch(function (error) {
      return res.status(404).json({ message: "Book with this ISBN not found" });
    });
});

// Task 12: Get book details based on Author using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Task 13: Get book details based on Title using Promise callbacks with Axios
public_users.get('/async/title/:title', function (req, res) {
  const title = req.params.title;

  axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`)
    .then(function (response) {
      return res.status(200).json(response.data);
    })
    .catch(function (error) {
      return res.status(404).json({ message: "No books found with this title" });
    });
});

module.exports.general = public_users;
