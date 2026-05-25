// Simple API helper using SWR and fetch
// Base URL can be overridden via REACT_APP_API_URL env variable
const BASE_URL = process.env.REACT_APP_API_URL || 'https://jsonplaceholder.typicode.com';

export const fetcher = async (url) => {
  const res = await fetch(`${BASE_URL}${url}`);
  if (!res.ok) {
    const err = new Error('Network response was not ok');
    err.status = res.status;
    throw err;
  }
  return res.json();
};

// Generic CRUD helpers – each returns a promise
export const apiGet = (endpoint) => fetcher(endpoint);
export const apiPost = (endpoint, data) =>
  fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());
export const apiPut = (endpoint, data) =>
  fetch(`${BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => r.json());
export const apiDelete = (endpoint) =>
  fetch(`${BASE_URL}${endpoint}`, { method: 'DELETE' }).then((r) => r.json());
