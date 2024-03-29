# Use an official Node runtime as a parent image
FROM node:latest

# Set the working directory in the container
WORKDIR /usr/src/app

# Install Puppeteer dependencies and Chromium
RUN apt-get update \
    && apt-get install -y wget gnupg ca-certificates procps libxss1 libgbm-dev chromium \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies using npm ci
RUN npm ci

# Copy the rest of your app's source code
COPY . .

# Compile TypeScript to JavaScript
RUN ./node_modules/.bin/tsc

# Expose port 3000 for the server
EXPOSE 3000

# Define environment variable for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium