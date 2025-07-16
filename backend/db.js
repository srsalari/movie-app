/**
 * db.js
 *
 * This file sets up and exports the MySQL database connection using mysql2.
 * It loads credentials from environment variables (via dotenv) for security.
 *
 * Best Practices Applied:
 * - Single Responsibility: Solely responsible for database connection.
 * - Good Names: Clear variable names.
 * - Encapsulation: Credentials loaded from environment variables.
 * - Error Handling: Basic error logging for connection issues.
 */

// Load environment variables from .env file
require("dotenv").config();

const mysql = require("mysql2/promise"); // Using the promise-based API for async/await

// Database connection configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "", // Default to empty string if not set
  database: process.env.DB_DATABASE || "myapp", // Ensure this matches your Docker DB name
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
};

// Create a connection pool for efficient database connections.
// A pool manages multiple connections, reusing them to avoid overhead.
const pool = mysql.createPool(dbConfig);

// Test the database connection when the pool is created
pool
  .getConnection()
  .then((connection) => {
    console.log("Successfully connected to MySQL database pool!");
    connection.release(); // Release the connection back to the pool
  })
  .catch((err) => {
    console.error("Error connecting to database pool:", err.message);
    // Exit the process if the database connection fails critically
    process.exit(1);
  });

// Export the pool to be used in other parts of the application (e.g., server.js)
module.exports = pool;
