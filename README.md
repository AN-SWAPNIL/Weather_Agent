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
git clone https://github.com/AN-SWAPNIL/Weather_Agent.git
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

- `POST /users` — Register a new user
- `POST /users/login` — Log in and retrieve a JWT
- `PUT /users/editpassword` — Change password (authenticated)
- `POST /users/location` — Update user's default location (authenticated)

### Weather

- `POST /api/query` — Make a conversational weather query with the given text input
- `GET /api/history` — Get a list of user's sessions/conversations
- `GET /api/history/:sessionId` — Get a specific conversation by ID
- `DELETE /api/history/:sessionId` — Delete a conversation by ID

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

## Getting Started

```bash
# Visit http://localhost:5173 in your browser
# Register a new account or login with existing credentials
```

### API Usage Examples

#### User Authentication

```bash
# Register a new user
curl -X POST http://localhost:4000/users -H "Content-Type: application/json" \
  -d '{"name": "Your Name", "email": "your@email.com", "password": "yourpassword"}'

# Login to get JWT token
curl -X POST http://localhost:4000/users/login -H "Content-Type: application/json" \
  -d '{"email": "your@email.com", "password": "yourpassword"}'
```

#### Weather Queries

```bash
# Make a weather query (replace YOUR_JWT_TOKEN with the token from login)
curl -X POST http://localhost:4000/api/query -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{"query": "Will it rain tomorrow?"}'

# Get session history
curl -X GET http://localhost:4000/api/history -H "Authorization: YOUR_JWT_TOKEN"

# Get specific session by ID
curl -X GET http://localhost:4000/api/history/YOUR_SESSION_ID -H "Authorization: YOUR_JWT_TOKEN"
```

#### Voice Interaction

```bash
# Transcribe audio to text
curl -X POST http://localhost:4000/audio/transcribe \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -F "audio=@./path/to/your/audio.wav"

# Convert text to speech
curl -X POST http://localhost:4000/audio/synthesize \
  -H "Content-Type: application/json" \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -d '{"text": "The weather forecast for tomorrow looks sunny."}'

# Make a voice query (combines STT + weather API + TTS)
curl -X POST http://localhost:4000/audio/query \
  -H "Authorization: YOUR_JWT_TOKEN" \
  -F "audio=@./path/to/your/audio.wav"
```

---

## Project Structure

```
client/                # React frontend (Vite, TailwindCSS)
├─ public/             # Static assets
├─ src/
│  ├─ components/      # Reusable UI components
│  ├─ pages/           # Route-based pages
│  └─ services/        # API service modules
└─ App.js, main.js     # Client entry point

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

- [@answapnil](https://github.com/AN-SWAPNIL) - Project Lead & Full-stack Developer

---

## License

MIT License - See LICENSE file for details
