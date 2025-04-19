# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application files
COPY . .


# Expose port 8000 (or the port your app uses)
EXPOSE 8000

# Serve the React app
CMD ["node", "index.js"]