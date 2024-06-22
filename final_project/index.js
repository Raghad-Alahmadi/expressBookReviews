const express = require('express');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware for '/customer' path
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Authentication middleware for '/customer/auth/*' path
app.use("/customer/auth/*", function auth(req, res, next) {
    // Implement your authentication mechanism here
    // For example, using JWT or session validation
    next();
});

const PORT = 5000;

// Routes setup
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
