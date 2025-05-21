import express from "express";
const app = express();

// middlewares
import errorHandler from "./middlewares/errorHandler.js";
import notFound from "./middlewares/notFound.js";

// import routes
import users from "./routes/user.route.js";
import weather from "./routes/weather.route.js";
import audio from "./routes/audio.route.js";

// essentials
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

app.use(morgan(":method :url :status :response-time ms"));
app.use(cors());
app.use(helmet());
app.use(express.json());
dotenv.config();

// routes
app.get("/", (req, res) => {
  res.send("Hello from express");
});

app.use("/users", users);
app.use("/api", weather);
app.use("/audio", audio);

app.use(notFound);
app.use(errorHandler);

export default app;
