# Weather Agent

A full-stack AI-powered weather assistant web app. Get conversational, human-friendly weather answers for any city, with session history and user authentication.

---

## Features

- Conversational weather Q&A (current, forecast, historical)
- User authentication (register, login, password change)
- Session history (recent queries, sidebar)
- Responsive React frontend (Vite, TailwindCSS)
- Node.js/Express backend with MongoDB
- Google Gemini LLM integration for natural language
- OpenWeatherMap API for weather data

---

## Prerequisites

- Node.js v16+ and npm
- MongoDB (local or cloud)
- OpenWeatherMap API key
- Google Gemini API key

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Weather_Agent
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment variables

- Copy `.env.example` to `.env` in the `server/` folder (create if missing):
  - `MONGODB_URI` (your MongoDB connection string)
  - `OPENWEATHER_API_KEY` (from https://openweathermap.org/api)
  - `GEMINI_API_KEY` (from Google Gemini)
  - `JWT_SECRET` (any random string)

### 4. Start the backend server

```bash
cd server
npm run dev
```

- The backend runs on [http://localhost:4000](http://localhost:4000)

### 5. Start the frontend client

```bash
cd ../client
npm run dev
```

- The frontend runs on [http://localhost:5173](http://localhost:5173)

---

## Usage

- Register a new user or log in.
- Ask weather questions in natural language (e.g., "Will it rain tomorrow in Paris?").
- View and manage your recent sessions in the sidebar.
- Change your password from the user menu.

---

## Project Structure

- `client/` — React frontend (Vite, TailwindCSS)
- `server/` — Node.js/Express backend, LLM agent, MongoDB models

---

## Developers

- [@answapnil](https://github.com/AN-SWAPNIL)
