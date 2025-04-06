# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
# COPY package*.json ./

# Install the dependencies
# RUN npm install

# Copy the rest of the application files
COPY . .

# Build the React app for production
RUN npm run build

# Install serve to serve the build folder
RUN npm install -g serve

# Expose port 3000 (or the port your app uses)
EXPOSE 3000

# Serve the React app
CMD ["serve", "-s", "build", "-l", "3000"]