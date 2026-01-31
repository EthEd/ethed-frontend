import { createAuthClient } from "better-auth/react";
import { emailOTPClient, adminClient } from "better-auth/client/plugins";

// Get the base URL for the auth client
const getBaseURL = () => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NODE_ENV === 'production' 
      ? 'https://ethed.com' 
      : 'http://localhost:3000';
  }
  // Client-side
  return process.env.NODE_ENV === 'production' 
    ? 'https://ethed.com' 
    : window.location.origin;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [
    emailOTPClient(),
    adminClient(),
  ]
});