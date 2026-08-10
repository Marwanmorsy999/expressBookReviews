const express = require('express');
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

// Task 1 – Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Task 2 – Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn]);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 3 – Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  let booksByAuthor = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].author === author) {
      booksByAuthor.push({
        isbn: isbn,
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

// Task 4 – Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let booksByTitle = [];

  Object.keys(books).forEach(isbn => {
    if (books[isbn].title === title) {
      booksByTitle.push({
        isbn: isbn,
        author: books[isbn].author,
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

// Task 5 – Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.send(books[isbn].reviews);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

// ========== Task 11 – Promise-based implementations ==========

// Helper functions using Promises
function getAllBooks() {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
}

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Unable to find book with ISBN " + isbn);
    }
  });
}

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    let result = [];
    Object.keys(books).forEach(isbn => {
      if (books[isbn].author === author) {
        result.push(books[isbn]);
      }
    });
    resolve(result);
  });
}

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    let result = [];
    Object.keys(books).forEach(isbn => {
      if (books[isbn].title === title) {
        result.push(books[isbn]);
      }
    });
    resolve(result);
  });
}

// Optional Promise-style routes (for demonstration / Task 11)
public_users.get('/promise/books', function (req, res) {
  getAllBooks()
    .then(bk => res.send(JSON.stringify(bk, null, 4)))
    .catch(err => res.status(500).send(err));
});

public_users.get('/promise/isbn/:isbn', function (req, res) {
  getBookByISBN(req.params.isbn)
    .then(bk => res.send(JSON.stringify(bk, null, 4)))
    .catch(err => res.status(404).send(err));
});

public_users.get('/promise/author/:author', function (req, res) {
  getBooksByAuthor(req.params.author)
    .then(result => res.send(JSON.stringify(result, null, 4)))
    .catch(err => res.status(500).send(err));
});

public_users.get('/promise/title/:title', function (req, res) {
  getBooksByTitle(req.params.title)
    .then(result => res.send(JSON.stringify(result, null, 4)))
    .catch(err => res.status(500).send(err));
});

module.exports.general = public_users;
