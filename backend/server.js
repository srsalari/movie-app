/**
 * server.js
 *
 * This file sets up an Express.js server to provide a RESTful API
 * for a Movie Database, interacting with a MySQL database.
 * It implements full CRUD operations for movies, including validation, search, and rating.
 *
 * This file is intended to be located in the 'backend' directory of your project.
 *
 * Requirements Met:
 * - Express server
 * - MySQL database (via db.js)
 * - Full CRUD operations (GET, POST, PUT, DELETE)
 * - Specific routes implemented for movies
 * - Validation (basic client-side error checking logic)
 * - Error handling (HTTP status codes, console logging)
 * - Connect to Express/MySQL
 *
 * Best Practices Applied:
 * - Single Responsibility: Routes handle specific HTTP methods/endpoints.
 * - Good Names: Clear route paths and function names.
 * - Consistent Returns: JSON responses for API calls.
 * - Parameter Limits: Route handlers take req, res.
 * - Asynchronous Handling: Uses async/await for database operations.
 * - Error Handling: Comprehensive error responses for API failures.
 * - Route Ordering: More specific routes placed before general ones (e.g., /search before /:id).
 */

const express = require("express");
const app = express();
// The path to db.js is relative to server.js.
// Since both will be in the 'backend' folder, './db' is correct.
const db = require("./db"); // Import the database connection pool

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Helper Functions for Validation ---
/**
 * Validates movie data for POST and PUT requests.
 * @param {object} data - The movie data from req.body.
 * @param {boolean} isNew - True if validating for a new movie (POST), false for update (PUT).
 * @returns {string|null} An error message if invalid, null otherwise.
 */
function validateMovieData(data, isNew = true) {
  if (
    isNew &&
    (!data.title || typeof data.title !== "string" || data.title.trim() === "")
  ) {
    return "Title is required and must be a non-empty string.";
  }
  if (
    isNew &&
    (!data.director ||
      typeof data.director !== "string" ||
      data.director.trim() === "")
  ) {
    return "Director is required and must be a non-empty string.";
  }
  if (
    data.year !== undefined &&
    (typeof data.year !== "number" ||
      !Number.isInteger(data.year) ||
      data.year <= 0)
  ) {
    return "Year must be a positive integer.";
  }
  if (
    data.genre !== undefined &&
    (typeof data.genre !== "string" || data.genre.trim() === "")
  ) {
    return "Genre must be a non-empty string.";
  }
  if (
    data.description !== undefined &&
    (typeof data.description !== "string" || data.description.trim() === "")
  ) {
    return "Description must be a non-empty string.";
  }
  if (
    data.poster_url !== undefined &&
    (typeof data.poster_url !== "string" ||
      !/^https?:\/\/.+\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(data.poster_url))
  ) {
    return "Poster URL must be a valid image URL (http/https).";
  }
  return null; // No validation errors
}

/**
 * Validates a rating value.
 * @param {number} rating - The rating value.
 * @returns {string|null} An error message if invalid, null otherwise.
 */
function validateRating(rating) {
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return "Rating must be an integer between 1 and 5.";
  }
  return null;
}

// --- API Routes ---

// GET /api/movies/search - Search movies by title, director, genre, or year
// IMPORTANT: Place more specific routes BEFORE more general ones (like /api/movies/:id)
app.get("/api/movies/search", async (req, res) => {
  const { title, director, genre, year } = req.query; // Extract query parameters.
  let sql = "SELECT * FROM movies WHERE 1=1"; // Start with a true condition
  const params = [];

  if (title) {
    sql += " AND title LIKE ?";
    params.push(`%${title}%`); // Use LIKE for partial, case-insensitive match
  }
  if (director) {
    sql += " AND director LIKE ?";
    params.push(`%${director}%`);
  }
  if (genre) {
    sql += " AND genre LIKE ?";
    params.push(`%${genre}%`);
  }
  if (year) {
    const parsedYear = parseInt(year, 10);
    if (isNaN(parsedYear) || parsedYear <= 0) {
      return res
        .status(400)
        .json({ error: "Search year must be a positive integer." });
    }
    sql += " AND year = ?";
    params.push(parsedYear);
  }

  if (params.length === 0) {
    return res.status(400).json({
      error:
        "Please provide at least one search criterion (title, director, genre, or year).",
    });
  }

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Error searching movies:", err);
    res.status(500).json({ error: "Failed to search movies." });
  }
});

// GET /api/movies - Get all movies
app.get("/api/movies", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM movies");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching all movies:", err);
    res.status(500).json({ error: "Failed to fetch movies." });
  }
});

// GET /api/movies/:id - Get one movie by ID
app.get("/api/movies/:id", async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || parseInt(id, 10) <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid movie ID. Must be a positive number." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM movies WHERE id = ?", [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: "Movie not found." });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(`Error fetching movie with ID ${id}:`, err);
    res.status(500).json({ error: "Failed to fetch movie." });
  }
});

// POST /api/movies - Add a new movie
app.post("/api/movies", async (req, res) => {
  const { title, director, year, genre, description, poster_url } = req.body;

  const validationError = validateMovieData(req.body, true);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO movies (title, director, year, genre, description, poster_url) VALUES (?, ?, ?, ?, ?, ?)",
      [
        title,
        director,
        year || null,
        genre || null,
        description || null,
        poster_url || null,
      ]
    );
    res.status(201).json({
      id: result.insertId,
      title,
      director,
      year: year || null,
      genre: genre || null,
      average_rating: 0.0,
      num_ratings: 0,
      description: description || null,
      poster_url: poster_url || null,
    });
  } catch (err) {
    console.error("Error adding movie:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "A movie with this title and director already exists.",
      });
    }
    res.status(500).json({ error: "Failed to add movie." });
  }
});

// PUT /api/movies/:id - Update an existing movie
app.put("/api/movies/:id", async (req, res) => {
  const { id } = req.params;
  const { title, director, year, genre, description, poster_url } = req.body;

  if (isNaN(id) || parseInt(id, 10) <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid movie ID. Must be a positive number." });
  }

  const validationError = validateMovieData(req.body, false);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const fieldsToUpdate = [];
  const values = [];

  if (title !== undefined) {
    fieldsToUpdate.push("title = ?");
    values.push(title);
  }
  if (director !== undefined) {
    fieldsToUpdate.push("director = ?");
    values.push(director);
  }
  if (year !== undefined) {
    fieldsToUpdate.push("year = ?");
    values.push(year);
  }
  if (genre !== undefined) {
    fieldsToUpdate.push("genre = ?");
    values.push(genre);
  }
  if (description !== undefined) {
    fieldsToUpdate.push("description = ?");
    values.push(description);
  }
  if (poster_url !== undefined) {
    fieldsToUpdate.push("poster_url = ?");
    values.push(poster_url);
  }

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: "No fields provided for update." });
  }

  values.push(id);

  const sql = `UPDATE movies SET ${fieldsToUpdate.join(", ")} WHERE id = ?`;

  try {
    const [result] = await db.query(sql, values);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Movie not found or no changes made." });
    } else {
      res.json({ message: "Movie updated successfully." });
    }
  } catch (err) {
    console.error(`Error updating movie with ID ${id}:`, err);
    res.status(500).json({ error: "Failed to update movie." });
  }
});

// DELETE /api/movies/:id - Remove a movie
app.delete("/api/movies/:id", async (req, res) => {
  const { id } = req.params;

  if (isNaN(id) || parseInt(id, 10) <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid movie ID. Must be a positive number." });
  }

  try {
    const [result] = await db.query("DELETE FROM movies WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: "Movie not found." });
    } else {
      res.json({ message: "Movie deleted successfully." });
    }
  } catch (err) {
    console.error(`Error deleting movie with ID ${id}:`, err);
    res.status(500).json({ error: "Failed to delete movie." });
  }
});

// POST /api/movies/:id/rate - Rate a movie
app.post("/api/movies/:id/rate", async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;

  if (isNaN(id) || parseInt(id, 10) <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid movie ID. Must be a positive number." });
  }

  const validationError = validateRating(rating);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const [movies] = await db.query(
      "SELECT average_rating, num_ratings FROM movies WHERE id = ?",
      [id]
    );

    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const currentMovie = movies[0];
    const oldAverageRating = parseFloat(currentMovie.average_rating);
    const oldNumRatings = currentMovie.num_ratings;

    const newNumRatings = oldNumRatings + 1;
    const newAverageRating =
      (oldAverageRating * oldNumRatings + rating) / newNumRatings;

    const [result] = await db.query(
      "UPDATE movies SET average_rating = ?, num_ratings = ? WHERE id = ?",
      [newAverageRating.toFixed(2), newNumRatings, id]
    );

    if (result.affectedRows === 0) {
      res
        .status(404)
        .json({ message: "Movie not found or no changes made during rating." });
    } else {
      res.json({
        message: "Movie rated successfully.",
        new_average_rating: parseFloat(newAverageRating.toFixed(2)),
        new_num_ratings: newNumRatings,
      });
    }
  } catch (err) {
    console.error(`Error rating movie with ID ${id}:`, err);
    res.status(500).json({ error: "Failed to rate movie." });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Movie API Endpoints:");
  console.log(`  GET /api/movies`);
  console.log(`  GET /api/movies/:id`);
  console.log(`  POST /api/movies`);
  console.log(`  PUT /api/movies/:id`);
  console.log(`  DELETE /api/movies/:id`);
  console.log(`  POST /api/movies/:id/rate - Body: { "rating": 1-5 }`);
  console.log(
    `  GET /api/movies/search?title=...&director=...&genre=...&year=...`
  );
});
