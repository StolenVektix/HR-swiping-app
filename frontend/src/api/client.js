const API_BASE = "http://localhost:8000";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let detail = `Erreur ${res.status}`;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      // ignore parse error
    }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),

  listMyListings: (token) => request("/listings", { token }),
  createListing: (token, payload) => request("/listings", { method: "POST", body: payload, token }),
  updateListing: (token, id, payload) => request(`/listings/${id}`, { method: "PATCH", body: payload, token }),
  deleteListing: (token, id) => request(`/listings/${id}`, { method: "DELETE", token }),
  listingMatches: (token, id) => request(`/listings/${id}/matches`, { token }),

  getFilter: (token) => request("/worker/filter", { token }),
  updateFilter: (token, payload) => request("/worker/filter", { method: "PUT", body: payload, token }),

  getFeed: (token) => request("/feed", { token }),
  swipe: (token, payload) => request("/swipe", { method: "POST", body: payload, token }),
  myMatches: (token) => request("/worker/matches", { token }),
};
