const API_URL = "https://vnz-challenge-deploy-latest.onrender.com/api/v1";

if (!API_URL) {
  throw new Error("Error");
}

export const env = {
  API_URL,
} as const;
