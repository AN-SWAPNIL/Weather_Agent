# Weather Agent

A full-stack AI-powered weather assistant web app. Get conversational, human-friendly weather answers for any city, with session history, user authentication, and voice interaction.

---

## Features

- Conversational weather Q&A (current, forecast, historical)
- Speech-to-text (transcribe audio queries)
- Text-to-speech (synthesize weather responses)
- Voice-based weather queries (upload audio and receive voice+text reply)
- User authentication (register, login, password change)
- Session history (recent queries, sidebar)
- Responsive React frontend (Vite, TailwindCSS)
- Node.js/Express backend with MongoDB
- Google Gemini LLM integration for natural language
- OpenWeatherMap API for weather data
- Azure Cognitive Services for speech-to-text and text-to-speech

---

## Prerequisites

- Node.js v16+ and npm
- MongoDB (local or cloud)
- OpenWeatherMap API key
- Google Gemini API key
- Azure Speech API Key and Region

---

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in the values:

```bash
PORT=4000
ENV=dev
MONGO_URI=<YOUR_MONGO_URI>
JWT_SECRET=<YOUR_JWT_SECRET>
OPENWEATHER_API_KEY=<YOUR_OPENWEATHER_API_KEY>
GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
AZURE_SPEECH_KEY=<YOUR_AZURE_SPEECH_KEY>
AZURE_SPEECH_REGION=<YOUR_AZURE_SPEECH_REGION>
TRY_AGAIN_MESSAGE=<YOUR_FALLBACK_MESSAGE>
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_API_KEY=<YOUR_LANGSMITH_API_KEY>
LANGSMITH_PROJECT=<YOUR_LANGSMITH_PROJECT>
```

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

### 3. Start the backend server

```bash
cd server
npm run dev
```

The backend runs on http://localhost:4000

### 4. Start the frontend client

```bash
cd client
npm run dev
```

The frontend runs on http://localhost:5173

---

## Testing

Run server-side tests:

```bash
cd server
npm run test-gemini
npm run test-openweather
```

---

## API Endpoints

### Authentication

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Log in and retrieve a JWT
- `POST /api/auth/change-password` — Change password (authenticated)

### Weather

- `GET /api/weather/current?city=<city>` — Get current weather
- `GET /api/weather/forecast?city=<city>` — Get forecast weather
- `GET /api/weather/history?city=<city>&start=<ISO>&end=<ISO>` — Get historical weather

### Audio

> (Requires authentication and multipart/form-data)

- `POST /api/audio/transcribe` — Upload audio file (`audio` field) to transcribe speech to text
- `POST /api/audio/synthesize` — Generate audio for provided text (JSON body `{ text: "..." }`)
- `POST /api/audio/query` — Upload audio file (`audio` field) for voice-based weather query; returns both text and base64 audio reply

---

## Usage

- Register or log in to the app
- Ask weather questions in text or voice
- View and manage your recent sessions in the sidebar
- Change your password from the user menu

---

## Project Structure

```
client/                # React frontend (Vite, TailwindCSS)
├─ public/             # Static assets
├─ src/
│  ├─ components/      # Reusable UI components
│  ├─ pages/           # Route-based pages
│  └─ services/        # API service modules

server/                # Node.js/Express backend
├─ controllers/        # Route handlers
├─ services/           # Business logic and external API integrations
├─ models/             # Mongoose schemas
├─ routes/             # Express routes
├─ middlewares/        # Express middleware
├─ data/               # Audio files and storage
└─ app.js, index.js    # Server entry point
```

---

## Developers

- [@answapnil](https://github.com/AN-SWAPNIL)
