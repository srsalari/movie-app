-- This script will be executed when the database container is first created.
-- It seeds the 'movies' table with some initial data.

USE movies;
CREATE TABLE movies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  director VARCHAR(255),
  year INT,
  genre VARCHAR(255),
  average_rating DECIMAL(3, 2) DEFAULT 0.00,
  -- e.g., 4.50
  num_ratings INT DEFAULT 0,
  description TEXT,
  poster_url VARCHAR(255)
);

-- Insert initial data
INSERT INTO
  movies (
    title,
    director,
    year,
    genre,
    description,
    poster_url
  )
VALUES
  ('Inception', 'Christopher Nolan', 2010, 'Sci-Fi', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg'),
  ('The Shawshank Redemption', 'Frank Darabont', 1994, 'Drama', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'),
  ('Pulp Fiction', 'Quentin Tarantino', 1994, 'Crime', 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg');