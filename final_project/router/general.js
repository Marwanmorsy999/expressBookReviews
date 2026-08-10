const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 7 – Register a new user
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

// ========== Basic routes (Tasks 1-6) ==========

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].author === author) {
      booksByAuthor.push({
        isbn: isbn,
        author: books[isbn].author,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByAuthor.length > 0) {
    res.send(JSON.stringify({ booksbyauthor: booksByAuthor }, null, 4));
  } else {
    res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].title === title) {
      booksByTitle.push({
        isbn: isbn,
        author: books[isbn].author,
        title: books[isbn].title,
        reviews: books[isbn].reviews
      });
    }
  });

  if (booksByTitle.length > 0) {
    res.send(JSON.stringify({ booksbytitle: booksByTitle }, null, 4));
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
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

// ========== Task 10-13 : Promise / async-await + Axios ==========

// Task 10 - Get all books using async/await + Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/');
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books", error: error.message });
  }
});

// Task 11 - Get book by ISBN using Promise + Axios
public_users.get('/async/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      return res.status(404).json({ message: "Book not found", error: error.message });
    });
});

// Task 12 - Get books by author using async/await + Axios
public_users.get('/async/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "Author not found", error: error.message });
  }
});

// Task 13 - Get books by title using Promise + Axios
public_users.get('/async/title/:title', function (req, res) {
  const title = req.params.title;
  axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(error => {
      return res.status(404).json({ message: "Title not found", error: error.message });
    });
});

module.exports.general = public_users;
