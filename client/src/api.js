import { ENV } from './config/env';
export const API = ENV.API_URL;

export const registerUser = async (data) => {
  const res = await window.fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Registration failed");
  }
  return res.json();
};
