import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URL) {
    console.log("MONGO_URL is not set.");
    process.exit(1);
}
if (!process.env.LOGIN_API_KEY) {
    console.log("LOGIN_API_KEY is not set.");
    process.exit(1);
}

const configuration = {
    LOGIN_API_URL: process.env.LOGIN_API_URL ?? "https://login.datasektionen.se",
    LOGIN_API_KEY: process.env.LOGIN_API_KEY,
    PLS_API_URL: process.env.PLS_API_URL ?? "https://pls.datasektionen.se/api",
    PORT: Number(process.env.PORT ?? 8000),
    MONGO_URL: process.env.MONGO_URL,
    SHORT_URL_LENGTH: Number(process.env.SHORT_URL_LENGTH ?? 4),
    NODE_ENV: process.env.NODE_ENV ?? "development",
};

export default configuration;