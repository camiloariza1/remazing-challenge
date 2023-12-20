# Remazing Challenge Application

## Introduction

This application scrapes product data from Amazon using Puppeteer and stores the results in a MongoDB database. It also includes a Node.js server to retrieve and display the product information.

## Prerequisites

Before running the application, make sure you have the following installed:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

This application has been containerized for easy setup and running.

## Running the Application

1. **Build and Run with Docker Compose**
   
   From the root of the project directory, build and start the application using Docker Compose:

   ```bash
    docker-compose up --build
    ```

    This command will build the Docker images and start the containers for the MongoDB database, the scraping service, and the server.

2. **Accessing the Application**

    Once the application is running, you can:

    - Access the server at http://localhost:3000/products to view the fetched product data.
    - Check the logs for the scraping service to ensure the scraping process is running as expected.