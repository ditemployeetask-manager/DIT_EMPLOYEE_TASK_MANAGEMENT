const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, method = "GET", body = null, options = {}) => {
  const token = localStorage.getItem("token");
  const { headers: optionHeaders = {}, ...restOptions } = options;

  const headers = {
    "Content-Type": "application/json",
    ...optionHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    ...restOptions,
  };

  if (body && !(body instanceof FormData)) {
    config.body = JSON.stringify(body);
  } else if (body && body instanceof FormData) {
    delete config.headers["Content-Type"];
    config.body = body;
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);

    
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("spreadsheetml")) {
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      return await response.blob();
    }

    const text = await response.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch (_) {
      json = { message: text || response.statusText || "Something went wrong" };
    }

    if (!response.ok) {
      throw new Error(json.message || "Something went wrong");
    }

    return json;
  } catch (error) {
    console.error(`API Error on ${method} ${path}:`, error.message);
    throw error;
  }
};

const api = {
  get: (path, options) => request(path, "GET", null, options),
  post: (path, body, options) => request(path, "POST", body, options),
  put: (path, body, options) => request(path, "PUT", body, options),
  patch: (path, body, options) => request(path, "PATCH", body, options),
  delete: (path, options) => request(path, "DELETE", null, options),
};

export default api;
