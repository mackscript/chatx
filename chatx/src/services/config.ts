// Environment configuration for ChatX application
export interface AppConfig {
  API_BASE_URL: string;
  SOCKET_URL: string;
  IS_PRODUCTION: boolean;
}

// Determine if we're in production based on environment
const isProduction = false;

// Configuration object with environment-specific URLs
export const config: AppConfig = {
  API_BASE_URL: isProduction
    ? "https://chatx.nextyfine.com/api"
    : "http://localhost:9028/api",

  SOCKET_URL: isProduction
    ? "https://chatx.nextyfine.com"
    : "http://localhost:9028",

  IS_PRODUCTION: isProduction,
};

console.log("isProduction", isProduction);
// Export individual URLs for convenience
export const { API_BASE_URL, SOCKET_URL, IS_PRODUCTION } = config;

// Default export
export default config;
