const BASE_URL = 'http://localhost:5003';
const API_URL = `${BASE_URL}/api`;

export const endpoints = {
  admin: {
    pendingUsers: `${API_URL}/admin/pending-users`,
    approvedUsers: `${API_URL}/admin/approved-users`,
    users: `${API_URL}/admin/users`
  },
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
