const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN;

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
};

export { firebaseConfig }
