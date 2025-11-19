// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true, // For sending JWT cookie
// });

// export default api;

import axios from "axios";
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For sending JWT cookie
});

// Request interceptor (token refresh or for logging)
// api.interceptors.request.use(
//   (config) => {
//     // console.log("API Request →", config.baseURL + config.url);
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

export default api;
