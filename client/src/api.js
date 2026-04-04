export const API = import.meta.env.VITE_API_URL || "https://bhie-api.onrender.com";

export const registerUser = async (data) => {
  const res = await fetch(`${API}/api/auth/register`, {
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
