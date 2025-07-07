const API_BASE_URL = 'http://localhost:5001';

class ApiService {
  static async register(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  static async login(credentials) {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return response.json();
  }

  static async submitMedicalHistory(historyData, token) {
    const response = await fetch(`${API_BASE_URL}/medical-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(historyData),
    });
    return response.json();
  }

  static async getMedicalHistory(username, token) {
    const response = await fetch(`${API_BASE_URL}/medical-history/${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async updateMedicalHistory(username, historyData, token) {
    const response = await fetch(`${API_BASE_URL}/medical-history/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(historyData),
    });
    return response.json();
  }
}

export default ApiService;