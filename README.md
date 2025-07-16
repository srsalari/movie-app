<!-- omit in toc -->

# Movie Management App

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A full-stack web application for managing a personal movie collection. This project features a modern, responsive frontend built with **Angular** and a robust RESTful API backend powered by **Node.js**, **Express**, and **MySQL**.

<!-- omit in toc -->

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Features

- **Full CRUD Functionality:** Create, Read, Update, and Delete movies in your collection.
- **Movie Ratings:** Assign a star rating (1-5) to any movie. The average rating and total number of ratings are calculated and displayed.
- **Live Search:** Instantly search for movies by title, director, genre, or year. API calls are debounced for optimal performance.
- **Inline Editing:** Seamlessly edit movie details directly within the movie card.
- **Responsive Design:** A polished UI that works on both desktop and mobile devices, built with a custom CSS theme inspired by Tailwind CSS.
- **Error Handling:** User-friendly feedback for API errors, loading states, and broken image links.

## Tech Stack

### Frontend

- **[Angular](https://angular.io/)**: A powerful framework for building dynamic single-page applications.
- **[TypeScript](https://www.typescriptlang.org/)**: For type-safe JavaScript.
- **Custom CSS**: Styled with a professional, maintainable CSS theme.

### Backend

- **[Node.js](https://nodejs.org/)**: A JavaScript runtime for building the server-side application.
- **[Express.js](https://expressjs.com/)**: A minimal and flexible Node.js web application framework.
- **[mysql2](https://www.npmjs.com/package/mysql2)**: A fast MySQL driver for Node.js.

### Database & Infrastructure

- **[MySQL](https://www.mysql.com/)**: A reliable open-source relational database.
- **[Docker](https://www.docker.com/)**: For running the MySQL database in a containerized environment.

## Screenshots

![Movie App Screenshot](./screenshot.png)
_(Note: You'll need to add a `screenshot.png` file to the root of your project for this image to display.)_

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- **Node.js and npm**: Download & Install Node.js
- **Angular CLI**: Install globally via npm: `npm install -g @angular/cli`
- **Docker**: Download & Install Docker Desktop

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/srsalari/movie-app.git
    cd movie-app
    ```

2.  **Setup the Database (with Docker):**
    Open a new terminal and run the following command to start a MySQL container. This will also create the `movies` database.

    ```sh
    docker run --name movie-db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=movies -d mysql:latest
    ```

    To create the necessary table, connect to the database using your preferred SQL client (e.g., TablePlus, DBeaver, or the command line) with the following credentials:

    - **Host**: `127.0.0.1`
    - **Port**: `3306`
    - **User**: `root`
    - **Password**: `password`

    Once connected, execute the following SQL script to create the `movies` table:

    ```sql
    USE movies;

    CREATE TABLE movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        director VARCHAR(255),
        year INT,
        genre VARCHAR(255),
        description TEXT,
        poster_url VARCHAR(255),
        average_rating DECIMAL(3, 2) DEFAULT 0.00,
        num_ratings INT DEFAULT 0
    );
    ```

3.  **Setup and Run the Backend Server:**
    Navigate to the `backend` directory, install dependencies, and start the server.

    ```sh
    cd backend
    npm install
    npm start
    ```

    The backend API will be running on `http://localhost:3000`.

4.  **Setup and Run the Frontend Application:**
    Open a **separate terminal**, navigate to the `frontend` directory, install dependencies, and run the Angular development server.
    ```sh
    cd ../frontend
    npm install
    ng serve --open
    ```
    The application will automatically open in your default browser at `http://localhost:4200`.

---

## API Endpoints

The backend provides the following RESTful API endpoints:

| Method   | Endpoint               | Description                            |
| :------- | :--------------------- | :------------------------------------- |
| `GET`    | `/api/movies`          | Retrieve all movies.                   |
| `POST`   | `/api/movies`          | Add a new movie.                       |
| `PUT`    | `/api/movies/:id`      | Update an existing movie by its ID.    |
| `DELETE` | `/api/movies/:id`      | Delete a movie by its ID.              |
| `GET`    | `/api/movies/search`   | Search for movies by query parameters. |
| `POST`   | `/api/movies/:id/rate` | Submit a rating for a specific movie.  |

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
