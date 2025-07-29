import api from './api';

class ExpenseService {
  async getExpenses(params = {}) {
    try {
      const response = await api.get('/expenses', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getExpense(id) {
    try {
      const response = await api.get(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createExpense(expenseData) {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateExpense(id, expenseData) {
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteExpense(id) {
    try {
      const response = await api.delete(`/expenses/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMonthlySummary() {
    try {
      const response = await api.get('/expenses/summary/current-month');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      return new Error('Network error. Please check your connection.');
    } else {
      return new Error('An unexpected error occurred.');
    }
  }
}

export const expenseService = new ExpenseService(); 