require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const port = 3000;

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// --- Database Connection ---
let db;

/**
 * Attempts to connect to the database with a retry mechanism.
 * This is crucial for Docker environments where the backend might start before the DB is ready.
 */
async function connectWithRetry() {
  let retries = 5;
  while (retries) {
    try {
      // Create a connection pool, which is more efficient than single connections
      db = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      console.log("Successfully connected to the database.");
      // Test the connection
      await db.query("SELECT 1");
      break; // Exit loop if connection is successful
    } catch (err) {
      console.error("Failed to connect to database:", err.message);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      if (retries === 0) {
        console.error(
          "Could not connect to database after multiple retries. Exiting."
        );
        process.exit(1); // Exit if connection fails after all retries
      }
      // Wait 5 seconds before the next retry
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

// --- API Endpoints ---

// GET all movies
app.get("/api/movies", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM movies ORDER BY title");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).json({ error: "Failed to fetch movies" });
  }
});

// GET movies by search term (searches across multiple fields)
app.get("/api/movies/search", async (req, res) => {
  const { term } = req.query; // Assuming a single search term for simplicity
  if (!term) {
    return res.status(400).json({ error: "Search term is required." });
  }

  const searchTerm = `%${term}%`;
  const query =
    "SELECT * FROM movies WHERE title LIKE ? OR director LIKE ? OR genre LIKE ?";

  try {
    const [rows] = await db.query(query, [searchTerm, searchTerm, searchTerm]);
    res.json(rows);
  } catch (err) {
    console.error("Error searching movies:", err);
    res.status(500).json({ error: "Failed to search movies" });
  }
});

// POST a new movie
app.post("/api/movies", async (req, res) => {
  const { title, director, year, genre, description, poster_url } = req.body;
  if (!title || !director) {
    return res.status(400).json({ error: "Title and Director are required." });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO movies (title, director, year, genre, description, poster_url) VALUES (?, ?, ?, ?, ?, ?)",
      [title, director, year, genre, description, poster_url]
    );
    const [newMovie] = await db.query("SELECT * FROM movies WHERE id = ?", [
      result.insertId,
    ]);
    res.status(201).json(newMovie[0]);
  } catch (err) {
    console.error("Error adding movie:", err);
    res.status(500).json({ error: "Failed to add movie" });
  }
});

// PUT (update) an existing movie
app.put("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  const movieData = req.body;
  try {
    await db.query("UPDATE movies SET ? WHERE id = ?", [movieData, id]);
    res.json({ message: "Movie updated successfully" });
  } catch (err) {
    console.error("Error updating movie:", err);
    res.status(500).json({ error: "Failed to update movie" });
  }
});

// DELETE a movie
app.delete("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM movies WHERE id = ?", [id]);
    res.json({ message: "Movie deleted successfully" });
  } catch (err) {
    console.error("Error deleting movie:", err);
    res.status(500).json({ error: "Failed to delete movie" });
  }
});

// POST a rating for a movie
app.post("/api/movies/:id/rate", async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ error: "Invalid rating. Must be between 1 and 5." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [movieRows] = await connection.query(
      "SELECT average_rating, num_ratings FROM movies WHERE id = ? FOR UPDATE",
      [id]
    );

    if (movieRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Movie not found" });
    }

    const movie = movieRows[0];
    const currentTotalRating = movie.average_rating * movie.num_ratings;
    const newNumRatings = movie.num_ratings + 1;
    const newTotalRating = currentTotalRating + rating;
    const newAverageRating = newTotalRating / newNumRatings;

    await connection.query(
      "UPDATE movies SET average_rating = ?, num_ratings = ? WHERE id = ?",
      [newAverageRating, newNumRatings, id]
    );

    await connection.commit();

    res.json({
      message: "Rating submitted successfully",
      new_average_rating: parseFloat(newAverageRating.toFixed(2)),
      new_num_ratings: newNumRatings,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error rating movie:", err);
    res.status(500).json({ error: "Failed to rate movie" });
  } finally {
    connection.release();
  }
});

/**
 * Starts the server after a successful database connection.
 */
async function startServer() {
  await connectWithRetry();
  app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
  });
}

startServer();
