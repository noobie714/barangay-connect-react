import axios from 'axios';

const API = axios.create({
  baseURL: 'https://barangay-connect-api.onrender.com', // ← change this
  withCredentials: true,
});

export const GET = (file, action, params = {}) =>
  API.get(`/${file}.php`, { params: { action, ...params } });

export const POST = (file, action, data = {}) =>
  API.post(`/${file}.php?action=${action}`, data);

export default API;