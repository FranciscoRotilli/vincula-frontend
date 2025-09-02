const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getApiUrl = () => {
  if (!API_URL) {
    throw new Error("API URL is not defined");
  }
  return API_URL;
};
