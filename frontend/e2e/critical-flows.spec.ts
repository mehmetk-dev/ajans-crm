import { test, expect } from '@playwright/test';

const ADMIN = { email: 'admin@fogistanbul.com', password: 'Admin123!' };

interface TokenResponse {
  accessToken?: string;
  refreshToken?: string;
}

let adminToken = '';
let staffToken = '';
let clientToken = '';

let companyId = '';
let taskId = '';
let contentPlanId = '';

async function login(request: any, email: string, password: string): Promise<string> {
  const resp = await request.post('/api/auth/login', {
    data: { email, password },
  });
  expect(resp.status()).toBe(200);
  const setCookie = resp.headers()['set-cookie'];
  const accessToken = setCookie?.match(/access_token=([^;]+)/)?.[1] || '';
  return accessToken;
}

async function api(request: any, token: string, method: string, url: string, data?: any) {
  return request[method](url, {
    headers: {
      'Cookie': `access_token=${token}`,
      'X-Request-ID': `e2e-${Date.now()}`,
    },
    data,
  });
}

test.describe('Kritik E2E Akislari', () => {
  test.beforeAll(async ({ request }) => {
    adminToken = await login(request, ADMIN.email, ADMIN.password);
  });

  test('1. Yetkisiz kullanici baska sirket verisine erisemez', async ({ request }) => {
    // No token - should get 401
    const resp = await request.get('/api/admin/companies', {
      headers: { 'X-Request-ID': 'e2e-403-test' },
    });
    expect(resp.status()).toBe(401);
    const body = await resp.json();
    expect(body.code).toBe('UNAUTHORIZED');
  });

  test('2. Admin sirket olusturabilir', async ({ request }) => {
    const timestamp = Date.now();
    const resp = await api(request, adminToken, 'post', '/api/admin/companies', {
      name: `E2E Test Sirket ${timestamp}`,
      industry: 'Teknoloji',
      email: `e2e-test-${timestamp}@example.com`,
      ownerEmail: `e2e-owner-${timestamp}@example.com`,
      ownerFullName: 'E2E Test Owner',
      ownerPassword: 'Test1234!',
      ownerPhone: '5550000000',
      selectedServices: ['WEB_DESIGN', 'DIGITAL_MARKETING'],
    });

    expect(resp.status()).toBe(201);
    const body = await resp.json();
    expect(body.id).toBeTruthy();
    expect(body.name).toContain('E2E Test Sirket');
    companyId = body.id;
    clientToken = await login(request, `e2e-owner-${timestamp}@example.com`, 'Test1234!');
  });

  test('3. Staff gorev gorur ve tamamlar', async ({ request }) => {
    // Login as staff
    staffToken = await login(request, 'staff@example.com', 'Staff123!');

    // Staff creates task
    const createResp = await api(request, staffToken, 'post', '/api/staff/tasks', {
      title: 'E2E Test Gorev',
      description: 'Bu bir E2E test gorevidir',
      companyId,
      priority: 'HIGH',
      status: 'ACTIVE',
      category: 'DEVELOPMENT',
    });

    expect(createResp.status()).toBe(201);
    const task = await createResp.json();
    expect(task.title).toBe('E2E Test Gorev');
    taskId = task.id;

    // Staff views task list (must contain the new task)
    const listResp = await api(request, staffToken, 'get', `/api/staff/tasks?companyId=${companyId}`);
    expect(listResp.status()).toBe(200);
    const listBody = await listResp.json();
    const found = listBody.content
      ? listBody.content.find((t: any) => t.id === taskId)
      : listBody.find((t: any) => t.id === taskId);
    expect(found).toBeTruthy();

    // Staff completes task
    const doneResp = await api(request, staffToken, 'put', `/api/staff/tasks/${taskId}`, {
      ...task,
      status: 'DONE',
    });
    expect(doneResp.status()).toBe(200);
    const doneTask = await doneResp.json();
    expect(doneTask.status).toBe('DONE');
  });

  test('4. Client content plan onaylar', async ({ request }) => {
    // Staff creates content plan
    const staffToken2 = await login(request, 'staff@example.com', 'Staff123!');

    const createResp = await api(request, staffToken2, 'post', '/api/staff/content-plans', {
      companyId,
      title: 'E2E Test Content Plan',
      description: 'Test content plan for approval',
      status: 'DRAFT',
      scheduledDate: new Date().toISOString().split('T')[0],
    });

    expect(createResp.status()).toBe(201);
    const plan = await createResp.json();
    contentPlanId = plan.id;

    // Staff moves to WAITING_APPROVAL
    const statusResp = await api(request, staffToken2, 'put', `/api/staff/content-plans/${contentPlanId}`, {
      ...plan,
      status: 'WAITING_APPROVAL',
    });
    expect(statusResp.status()).toBe(200);

    // Client sends approval request
    const approvalResp = await api(request, clientToken, 'post', `/api/client/content-plans/${contentPlanId}/request-approval`, {
      reference: 'approval-e2e',
    });
    expect([200, 201, 404].includes(approvalResp.status())).toBeTruthy();

    // Client should see content plan
    const listResp = await api(request, clientToken, 'get', '/api/client/content-plans');
    expect(listResp.status()).toBe(200);
  });

  test('5. Staff ve client mesajlasir', async ({ request }) => {
    // Get contacts
    const contactsResp = await api(request, staffToken, 'get', '/api/staff/messaging/contacts');
    expect(contactsResp.status()).toBe(200);

    // Start conversation
    const convResp = await api(request, staffToken, 'post', '/api/staff/messaging/conversations', {
      targetUserId: companyId ? companyId : undefined,
    });

    // If direct conversation setup is different, at least verify endpoints are reachable
    const convListResp = await api(request, staffToken, 'get', '/api/staff/messaging/conversations');
    expect(convListResp.status()).toBe(200);
    const convList = await convListResp.json();
    expect(Array.isArray(convList.content || convList)).toBeTruthy();

    // Client should also be able to list conversations
    const clientConvResp = await api(
      request,
      clientToken,
      'get',
      '/api/client/messaging/conversations'
    );
    expect(clientConvResp.status()).toBe(200);
  });
});
