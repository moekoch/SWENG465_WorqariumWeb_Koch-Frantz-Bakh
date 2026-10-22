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

**Prerequisite:** Start the backend server before running the web application. The shared backend provides the API endpoints, authentication, and MongoDB database used by both the web and mobile applications.

1. Clone and start the backend server: [**SWENG465_WorqServer_Koch-Frantz-Bakh**](https://github.com/moekoch/SWENG465_WorqServer_Koch-Frantz-Bakh).
2. In a separate terminal, navigate to the web application directory and run:

```bash
npm run dev
```

For API endpoint details and interactive Swagger/OpenAPI documentation, refer to the backend repository.
