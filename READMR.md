1. Create a MySQL docker instance: 
run: docker run --name some-mysql --rm -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=myapp -p 3306:3306 -d mysql:latest

2. Connect to database: mysql -u root -p -h 127.0.0.1
provide the root password

3. Create the database for movie app: CREATE DATABASE movies

4. Select movies database: use movies; 

5. Database Table Schema (movies table):

We'll use the suggested fields, including those for rating. 
Create schema: 
CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    director VARCHAR(255),
    year INT,
    genre VARCHAR(255),
    average_rating DECIMAL(3, 2) DEFAULT 0.00, -- e.g., 4.50
    num_ratings INT DEFAULT 0,
    description TEXT,
    poster_url VARCHAR(255)
);

6. Create and initialize frontend folder by running:
Create the Angular project inside the frontend folder:
ng new frontend --directory frontend

7. Generate a service to interact with the backend API:
ng generate service movie

8.Generate the main component for listing movies:
ng generate component movie-list

9. Git initialized:
echo "# movie-app" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/srsalari/movie-app.git
git push -u origin main