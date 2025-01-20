# Movie API with Redis Caching

This project is a **Node.js API** that provides a RESTful interface for managing movies and directors. The application is containerized using **Docker**. The project also utilizes **Redis** for caching, ensuring fast retrieval of frequently requested data.

## Features
- CRUD operations for **movies** and **directors**.
- Caching with **Redis** to optimize performance.
- Clean architecture and separation of concerns.
- Containerized using **Docker** for ease of deployment.
- **TypeScript** for type safety.
- Unit testing with **Jest**.

## Prerequisites
- **Node.js** (version >= 18)
- **Docker**
- **MongoDB**
- **Redis**

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/Atakan56A/TestCase
cd movie-api

### 2. Install Dependencies
npm install

### 3. Run Redis using Docker
docker run --name redis -p 6379:6379 -d redis

### 4. Build and Run the API
docker build -t movie-api .
docker run -p 3000:3000 movie-api

### Unit Testing
Unit tests have been implemented using Jest. All test classes can be found in the tests folder.

#### Running Tests
To run the unit tests, use the following command:
npm test