/**
 * API Configuration
 * Contains environment-specific configuration for API endpoints
 */

const environments = {
  development: {
    baseURL: "http://localhost:4000",
  },
  production: {
    baseURL: "https://weather-agent-qxfz.onrender.com",
  },
};

// Determine current environment (using Vite's import.meta if available)
// Fallback to development if not specified
const currentEnv = import.meta.env?.MODE || "development";

// Export the configuration for the current environment
const config = {
  apiUrl: environments[currentEnv]?.baseURL || environments.development.baseURL
};

export default config;
