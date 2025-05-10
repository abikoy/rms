export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  // Clean the token by removing any whitespace
  const cleanToken = token.trim();
  
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanToken}`,
      'x-auth-token': cleanToken
    }
  };
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const authState = localStorage.getItem('authState');
  
  if (!token || !authState) {
    return false;
  }

  try {
    const state = JSON.parse(authState);
    return state.isAuthenticated && state.user;
  } catch {
    return false;
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('authState');
};
