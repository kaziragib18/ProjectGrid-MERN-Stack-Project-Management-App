# Use a lightweight Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better Docker caching)
COPY package*.json ./

# Install backend dependencies
RUN npm ci

# Copy the rest of the backend code
COPY . .

# Expose the port your backend runs on
EXPOSE 5000

# Start the backend server
CMD ["npm", "run", "start"]
