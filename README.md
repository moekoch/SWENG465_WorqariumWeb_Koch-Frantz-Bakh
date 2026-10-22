# 🐠🐠🐠 Workquarium — Web 

Workquarium is a virtual underwater social and coworking platform where users can focus, socialize, play games, and connect with others.

## Features

- Virtual coworking spaces
- Silent and group focus sessions
- Creature-based user statuses and presence
- Public and private rooms
- Tankmate/friend system
- Real-time chat and optional calls
- Multiplayer games and social activities
- Personal aquarium customization
- Points, achievements, and progression
- Language translation compatibility
- Light/Dark modes 

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Socket.IO

## Architecture

The Workquarium web application connects to a shared backend, authentication system, and database used by both the web and mobile applications.

## Run Web App

### 1. Configure Environment Variables

In the web application directory, create a `.env` file using the provided `.env.example` as a template.

```bash
cp .env.example .env
```

Configure the required environment variables in `.env`:

```env
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@worqcluster.xdkdjdc.mongodb.net/?appName=WorqCluster
JWT_SECRET=<secret>
```

- **`MONGODB_URI`** — Replace `<db_username>` and `<db_password>` with your MongoDB database credentials. Ensure your IP address is permitted by the MongoDB Atlas network access settings.
- **`JWT_SECRET`** — Generate a secure secret using Node.js:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

  Copy the generated value into `.env` in place of `<secret>`.

> **Note:** Never commit `.env` or expose your database credentials or JWT secret. Keep `.env.example` as a template without real credentials.

### 2. Start the Backend Server

Before starting the web application, clone and configure the shared backend repository:

[**SWENG465_WorqServer_Koch-Frantz-Bakh**](https://github.com/moekoch/SWENG465_WorqServer_Koch-Frantz-Bakh)

Follow the backend repository's setup instructions to configure its environment variables, install dependencies, connect to MongoDB, and start the server.

The backend provides the API endpoints, authentication, and MongoDB database shared by the web and mobile applications. Swagger/OpenAPI documentation is also available through the backend.

### 3. Install Dependencies and Start the Web App

In a separate terminal, navigate to the web application directory and run:

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal to access Workquarium.

> **Important:** Keep the backend server running while using the web application so API requests and authentication can function correctly.
