// Auth utility functions

export const clearAllAuthData = () => {
  // Clear localStorage
  localStorage.removeItem('auth_tokens');
  localStorage.removeItem('user_profile');
  localStorage.removeItem('user_preferences');
  
  // Clear sessionStorage if any
  sessionStorage.clear();
  
  console.log('All auth data cleared');
};

export const debugAuthState = () => {
  console.log('=== AUTH DEBUG STATE ===');
  console.log('localStorage auth_tokens:', localStorage.getItem('auth_tokens'));
  console.log('localStorage user_profile:', localStorage.getItem('user_profile'));
  console.log('sessionStorage:', sessionStorage);
  console.log('========================');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};