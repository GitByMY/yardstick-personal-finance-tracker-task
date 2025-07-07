const API_BASE_URL = 'http://localhost:3001/api';

// API utility functions
export const api = {
  // Generic request function
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Transactions
  transactions: {
    async getAll(params: any = {}) {
      const queryString = new URLSearchParams(params).toString();
      return api.request(`/transactions?${queryString}`);
    },

    async getById(id: string) {
      return api.request(`/transactions/${id}`);
    },

    async create(transaction: any) {
      return api.request('/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
    },

    async update(id: string, transaction: any) {
      return api.request(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(transaction),
      });
    },

    async delete(id: string) {
      return api.request(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },

    async getMonthlyTotals(year: number, userId = 'default_user') {
      return api.request(`/transactions/analytics/monthly/${year}?userId=${userId}`);
    },

    async getCategoryTotals(startDate: string, endDate: string, userId = 'default_user') {
      return api.request(`/transactions/analytics/categories?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
    },
  },

  // Categories
  categories: {
    async getAll(userId = 'default_user') {
      return api.request(`/categories?userId=${userId}`);
    },

    async getById(id: string) {
      return api.request(`/categories/${id}`);
    },

    async create(category: any) {
      return api.request('/categories', {
        method: 'POST',
        body: JSON.stringify(category),
      });
    },

    async update(id: string, category: any) {
      return api.request(`/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
    },

    async delete(id: string) {
      return api.request(`/categories/${id}`, {
        method: 'DELETE',
      });
    },

    async initialize(userId = 'default_user') {
      return api.request('/categories/initialize', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    },
  },

  // Budgets
  budgets: {
    async getAll(params: any = {}) {
      const queryString = new URLSearchParams(params).toString();
      return api.request(`/budgets?${queryString}`);
    },

    async getById(id: string) {
      return api.request(`/budgets/${id}`);
    },

    async create(budget: any) {
      return api.request('/budgets', {
        method: 'POST',
        body: JSON.stringify(budget),
      });
    },

    async update(id: string, budget: any) {
      return api.request(`/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(budget),
      });
    },

    async delete(id: string) {
      return api.request(`/budgets/${id}`, {
        method: 'DELETE',
      });
    },

    async getBudgetVsActual(year: number, userId = 'default_user') {
      return api.request(`/budgets/analytics/vs-actual/${year}?userId=${userId}`);
    },
  },

  // Users
  users: {
    async getById(id: string) {
      return api.request(`/users/${id}`);
    },

    async getByEmail(email: string) {
      return api.request(`/users/email/${email}`);
    },

    async create(user: any) {
      return api.request('/users', {
        method: 'POST',
        body: JSON.stringify(user),
      });
    },

    async update(id: string, user: any) {
      return api.request(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(user),
      });
    },
  },

  // Health check
  async health() {
    return api.request('/health');
  },
};

export default api;