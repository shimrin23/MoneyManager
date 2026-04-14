import { describe, it, expect } from 'vitest';
import { apiClient } from '../api/client';

describe('API Client', () => {
  it('should be defined', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have default baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe(
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
    );
  });

  it('should have interceptors configured', () => {
    expect(apiClient.interceptors.request.handlers).toBeDefined();
    expect(apiClient.interceptors.response.handlers).toBeDefined();
  });
});
