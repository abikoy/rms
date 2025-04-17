const API_URL = 'http://localhost:5003/api';

export const endpoints = {
  auth: {
    login: `${API_URL}/auth/login`,
    register: `${API_URL}/auth/register`,
    profile: `${API_URL}/auth/profile`,
    user: `${API_URL}/auth/user`,
  },
  resources: {
    list: `${API_URL}/resources`,
    transfer: `${API_URL}/resources/transfer`,
    byDepartment: (dept) => `${API_URL}/resources/department/${dept}`,
  }
};

export default API_URL;
