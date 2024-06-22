const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { isValid, users } = require("./auth_users.js");
const booksdb = require("./booksdb.js");
const customer_routes = require('./auth_users.js').authenticated;

const public_users = express.Router();
const regd_users = express.Router();

// Middleware for session handling
public_users.use(session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Task 1: Get all books using async-await with Axios
public_users.get('/', async function(req, res) {
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    const books = response.data;
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Task 2: Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async function(req, res) {
  let isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/api/books/${isbn}`);
    const book = response.data;
    res.status(200).json(book);
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error);
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 3: Get book details based on Author using async-await with Axios
public_users.get('/author/:author', async function(req, res) {
  let author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/api/books?author=${author}`);
    const matchingBooks = response.data;
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Task 4: Get book details based on Title using async-await with Axios
public_users.get('/title/:title', async function(req, res) {
  let title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/api/books?title=${title}`);
    const matchingBooks = response.data;
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    console.error(`Error fetching books by title ${title}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Task 5: Get book reviews based on ISBN
public_users.get('/review/:isbn', async function(req, res) {
  let isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/api/reviews/${isbn}`);
    const reviews = response.data;
    res.status(200).json(reviews);
  } catch (error) {
    console.error(`Error fetching reviews for book with ISBN ${isbn}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Task 6: Register a new user
public_users.post("/register", async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (users.hasOwnProperty(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  try {
    users[username] = password;
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Task 7: Login as a registered user
public_users.post("/login", async (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!users.hasOwnProperty(username) || users[username] !== password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  try {
    req.session.user = username;
    const accessToken = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Task 8: Add or modify a book review
regd_users.post("/review/:isbn", async (req, res) => {
  let isbn = req.params.isbn;
  let { review } = req.body;
  let username = req.session.user;
  if (!review) {
    return res.status(400).json({ message: "Review content is required" });
  }
  try {
    // Check if user already reviewed this book
    let existingReview = booksdb.reviews.find(r => r.isbn === isbn && r.username === username);
    if (existingReview) {
      existingReview.review = review;
    } else {
      booksdb.reviews.push({ isbn, username, review });
    }
    return res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error(`Error adding review for book with ISBN ${isbn}:`, error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Task 9: Delete a book review
regd_users.delete("/review/:isbn", async (req, res) => {
  let isbn = req.params.isbn;
  let username = req.session.user;
  try {
    let initialLength = booksdb.reviews.length;
    booksdb.reviews = booksdb.reviews.filter(r => !(r.isbn === isbn && r.username === username));
    if (booksdb.reviews.length < initialLength) {
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Review not found or you do not have permission to delete" });
    }
  } catch (error) {
    console.error(`Error deleting review for book with ISBN ${isbn}:`, error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
// Task 10: Get all books using async-await with Axios
public_users.get('/', async function(req, res) {
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    const books = response.data;
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Task 11: Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async function(req, res) {
  let isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/api/books/${isbn}`);
    const book = response.data;
    res.status(200).json(book);
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error);
    res.status(404).json({ message: "Book not found" });
  }
});

// Task 12: Get book details based on Author using async-await with Axios
public_users.get('/author/:author', async function(req, res) {
  let author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/api/books?author=${author}`);
    const matchingBooks = response.data;
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Task 13: Get book details based on Title using async-await with Axios
public_users.get('/title/:title', async function(req, res) {
  let title = req.params.title;
  try {
    const response = await axios.get(`http://localhost:5000/api/books?title=${title}`);
    const matchingBooks = response.data;
    if (matchingBooks.length > 0) {
      res.status(200).json(matchingBooks);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    console.error(`Error fetching books by title ${title}:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
});
module.exports.general = public_users;
module.exports.authenticated = regd_users;
