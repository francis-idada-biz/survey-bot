import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://survey-bot-backend.onrender.com';

test.describe('API Health Checks', () => {
  test('should return healthy status from /health endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.ok).toBe(true);
  });

  test('should return database connection status from /test-db', async ({ request }) => {
    const response = await request.get(`${API_URL}/test-db`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('userCount');
  });
});

test.describe('Auth API Endpoints', () => {
  test('should login with valid credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'admin@test.com',
        password: 'Admin123!'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
    expect(data.user).toHaveProperty('email', 'admin@test.com');
    expect(data.user).toHaveProperty('role', 'admin');
  });

  test('should reject invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'wrong@email.com',
        password: 'wrongpassword'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('should get current user with valid token', async ({ request }) => {
    // First login to get token
    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'admin@test.com',
        password: 'Admin123!'
      }
    });
    
    const { token } = await loginResponse.json();
    
    // Then get current user
    const response = await request.get(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('email', 'admin@test.com');
    expect(data).toHaveProperty('role', 'admin');
  });

  test('should reject request without token', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/auth/me`);
    
    expect(response.status()).toBe(401);
  });

  test('should reject request with invalid token', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token-123'
      }
    });
    
    expect(response.status()).toBe(401);
  });
});

test.describe('Password Reset API', () => {
  test('should accept password reset request', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/request-password-reset`, {
      data: {
        email: 'admin@test.com'
      }
    });
    
    // Should return success even for non-existent emails (security best practice)
    expect(response.status()).toBe(200);
  });

  test('should reject password reset with invalid token', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/reset-password`, {
      data: {
        token: 'invalid-token',
        password: 'NewPassword123!'
      }
    });
    
    expect(response.status()).toBe(400);
  });
});

test.describe('User Invitation API', () => {
  let adminToken;

  test.beforeAll(async ({ request }) => {
    // Get admin token for authenticated requests
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'admin@test.com',
        password: 'Admin123!'
      }
    });
    
    const data = await response.json();
    adminToken = data.token;
  });

  test('should send invitation as admin', async ({ request }) => {
    const testEmail = `test${Date.now()}@example.com`;
    
    const response = await request.post(`${API_URL}/api/users/invite`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        email: testEmail,
        role: 'student'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('message');
  });

  test('should reject invitation without auth', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/users/invite`, {
      data: {
        email: 'test@example.com',
        role: 'student'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('should reject invitation with invalid role', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/users/invite`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        email: 'test@example.com',
        role: 'superadmin' // Invalid role
      }
    });
    
    expect(response.status()).toBe(400);
  });
});

test.describe('User Management API', () => {
  let adminToken;

  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'admin@test.com',
        password: 'Admin123!'
      }
    });
    
    const data = await response.json();
    adminToken = data.token;
  });

  test('should get all users as admin', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  test('should create new admin user', async ({ request }) => {
    const testEmail = `admin${Date.now()}@example.com`;
    
    const response = await request.post(`${API_URL}/api/users/create-admin`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        name: 'Test Admin',
        email: testEmail
      }
    });
    
    // Expect either 201 (created) or 200 (success)
    expect([200, 201]).toContain(response.status());
  });

  test('should get user by ID', async ({ request }) => {
    // First get all users to find an ID
    const usersResponse = await request.get(`${API_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    const users = await usersResponse.json();
    const userId = users[0].id;
    
    // Then get specific user
    const response = await request.get(`${API_URL}/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('id', userId);
  });
});

test.describe('CORS Configuration', () => {
  test('should accept requests from allowed origin', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`, {
      headers: {
        'Origin': 'https://survey-bot-flame.vercel.app'
      }
    });
    
    expect(response.status()).toBe(200);
    
    const headers = response.headers();
    expect(headers['access-control-allow-origin']).toBeTruthy();
  });

  test('should handle OPTIONS preflight request', async ({ request }) => {
    const response = await request.fetch(`${API_URL}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://survey-bot-flame.vercel.app',
        'Access-Control-Request-Method': 'POST'
      }
    });
    
    expect(response.status()).toBe(204);
  });
});

test.describe('Error Handling', () => {
  test('should return 404 for non-existent endpoint', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/non-existent-endpoint`);
    
    expect(response.status()).toBe(404);
  });

  test('should return 400 for malformed request', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        // Missing required fields
      }
    });
    
    expect(response.status()).toBe(400);
  });

  test('should handle large payloads gracefully', async ({ request }) => {
    const largePayload = {
      email: 'test@example.com',
      password: 'a'.repeat(10000) // Very long password
    };
    
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: largePayload
    });
    
    // Should handle gracefully (either 400 or 401)
    expect([400, 401, 413]).toContain(response.status());
  });
});
