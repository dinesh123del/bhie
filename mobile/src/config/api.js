import Constants from 'expo-constants';

const getBackendUrl = () => {
  // Use Production URL for live app
  const PRODUCTION_URL = 'https://bhie-app.vercel.app'; 
  
  if (!__DEV__) {
    return PRODUCTION_URL;
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (!host) return 'http://localhost:5000';
  return `http://${host}:5000`;
};

export const API_URL = getBackendUrl();
export const REGISTER_TOKEN_URL = `${API_URL}/api/notifications/register`;
