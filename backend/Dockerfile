# Stage 1: Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application source code into the container
COPY . .

# The backend API runs on port 3000
EXPOSE 3000

# Command to run the application when the container starts
CMD ["npm", "start"]