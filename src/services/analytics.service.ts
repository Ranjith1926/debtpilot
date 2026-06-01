import { MockAPI } from '@api/mock.client';

export class AnalyticsService {
  static async getMonthlyData() {
    const response = await MockAPI.analytics.getMonthly();
    return response.data;
  }

  static async getLoanDistribution() {
    const response = await MockAPI.analytics.getDistribution();
    return response.data;
  }

  static async getInsights() {
    const response = await MockAPI.insights.getAll();
    return response;
  }

  static async getReminders() {
    const response = await MockAPI.reminders.getAll();
    return response;
  }
}
