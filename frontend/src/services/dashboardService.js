import api from './api';

class DashboardService {
  async getSummary(period = 'current-month') {
    try {
      const response = await api.get('/dashboard/summary', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCharts(period = 'current-month') {
    try {
      const response = await api.get('/dashboard/charts', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getInsights() {
    try {
      const response = await api.get('/dashboard/insights');
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

export const dashboardService = new DashboardService(); 