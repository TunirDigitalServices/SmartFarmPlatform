# Use Node.js 20 as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Set environment variable to resolve crypto issue
# ENV NODE_OPTIONS=--openssl-legacy-provider


# Copy package.json and install dependencies
COPY package.json yarn.lock ./
RUN npm i -g yarn 
RUN yarn

# Copy the rest of the application files
COPY . .

# RUN npx update-browserslist-db@latest
# Set file permissions to ensure execution rights
RUN chmod -R 755 /app/node_modules/.bin
# Build the React app for production
# RUN npm run start

# Install serve to serve the build folder
# RUN npm install -g serve

# Expose port 3000 (or the port your app uses)
EXPOSE 3000

# Serve the React app
# CMD ["serve", "-s", "build", "-l", "3000"]
CMD ["npm","start"]