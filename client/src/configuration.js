const Configuration = {
    apiUrl: process.env.REACT_APP_API_URL ?? "http://localhost:8000",
    loginApiUrl: process.env.REACT_APP_LOGIN_API_URL ?? "https://login.datasektionen.se",
};

export default Configuration;
