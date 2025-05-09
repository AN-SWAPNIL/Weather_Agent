// Test script for OpenWeatherMap API
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

async function testOpenWeatherAPI() {
  try {
    console.log("Testing OpenWeatherMap API connection...");

    // API configuration
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const city = "London"; // Test city
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    console.log(`Requesting weather data for: ${city}`);
    const response = await axios.get(url);

    console.log("\nOpenWeatherMap API Response:");
    console.log("=============================");
    console.log("City:", response.data.name);
    console.log("Country:", response.data.sys.country);
    console.log(
      "Weather:",
      response.data.weather[0].main,
      "-",
      response.data.weather[0].description
    );
    console.log("Temperature:", response.data.main.temp, "°C");
    console.log("Feels like:", response.data.main.feels_like, "°C");
    console.log("Humidity:", response.data.main.humidity, "%");
    console.log("Wind speed:", response.data.wind.speed, "m/s");

    console.log("\nOpenWeatherMap API test successful!");
  } catch (error) {
    console.error("\nOpenWeatherMap API test failed!");
    console.error(
      "Error details:",
      error.response?.data?.message || error.message
    );
    if (error.response?.status === 401) {
      console.error(
        "Hint: Your OpenWeatherMap API key might be invalid. Check your .env file."
      );
    }
  }
}

// Run the test
testOpenWeatherAPI();
