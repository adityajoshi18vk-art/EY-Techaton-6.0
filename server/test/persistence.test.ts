import assert from 'node:assert/strict';
import { after, before, beforeEach, mock, test } from 'node:test';
import { once } from 'node:events';
import type { Server } from 'node:http';
import type { Db } from 'mongodb';
import express from 'express';
const mongodb: typeof import('../src/db/mongodb') = require('../src/db/mongodb');

let database: Db | null = null;
let connected = false;
let server: Server;
let baseUrl: string;

before(async () => {
  // Install before loading booking routes, which attempt database seeding on import.
  mock.method(mongodb, 'getDB', async () => database);
  mock.method(mongodb, 'isMongoConnected', () => connected);
  const { bookingRouter } = require('../src/routes/booking');
  const { chatHistoryRouter } = require('../src/routes/chatHistory');
  const app = express();
  app.use(express.json());
  app.use('/api', bookingRouter, chatHistoryRouter);
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  baseUrl = `http://127.0.0.1:${address.port}/api`;
});

beforeEach(() => {
  database = null;
  connected = false;
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
  mock.restoreAll();
});

function useCollection(name: string, collection: object) {
  connected = true;
  database = {
    collection(actualName: string) {
      assert.equal(actualName, name);
      return collection;
    },
  } as unknown as Db;
}

async function request(path: string, method = 'GET', body?: unknown) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

const booking = {
  customerId: 'customer-test',
  customerName: 'Test Customer',
  vehicleId: 'vehicle-test',
  vin: 'TESTVIN12345678901',
  serviceType: 'Oil Change',
  scheduledDate: '2030-01-20',
  scheduledTime: '10:00',
  location: 'Test Service Center',
  notes: 'Customer request',
};

test('booking validates required fields before accessing storage', async () => {
  const getCollection = mock.fn();
  database = { collection: getCollection } as unknown as Db;
  const result = await request('/booking', 'POST', { ...booking, customerId: '' });
  assert.equal(result.status, 400);
  assert.equal(result.body.error, 'Invalid booking data');
  assert.ok(result.body.details.some((issue: { path: string[] }) => issue.path.includes('customerId')));
  assert.equal(getCollection.mock.callCount(), 0);
});

test('booking persists validated data with server-owned defaults before reporting success', async () => {
  const insertOne = mock.fn(async () => ({ insertedId: 'database-id' }));
  useCollection('bookings', { countDocuments: async () => 12, insertOne });
  const result = await request('/booking', 'POST', {
    ...booking, id: 'forged', status: 'completed', estimatedCost: 0,
  });
  assert.equal(result.status, 201);
  assert.equal(result.body.success, true);
  assert.deepEqual(result.body.booking, {
    ...booking, id: 'B013', status: 'scheduled', estimatedDuration: 90,
    estimatedCost: 150, createdAt: result.body.booking.createdAt,
  });
  assert.ok(Number.isFinite(Date.parse(result.body.booking.createdAt)));
  assert.equal(insertOne.mock.callCount(), 1);
  assert.deepEqual(insertOne.mock.calls[0].arguments, [result.body.booking]);
});

test('booking does not report success or silently fall back when a database write fails', async () => {
  useCollection('bookings', {
    countDocuments: async () => 12,
    insertOne: async () => { throw new Error('storage failure'); },
  });
  const result = await request('/booking', 'POST', booking);
  assert.equal(result.status, 500);
  assert.deepEqual(result.body, { error: 'Failed to create booking' });
  database = null;
  connected = false;
  assert.equal((await request('/booking/B013')).status, 404);
});

test('booking remains creatable and retrievable when MongoDB is unavailable', async () => {
  const created = await request('/booking', 'POST', booking);
  assert.equal(created.status, 201);
  const fetched = await request(`/booking/${created.body.booking.id}`);
  assert.equal(fetched.status, 200);
  assert.deepEqual(fetched.body, created.body.booking);
  const filtered = await request('/booking?status=scheduled');
  assert.equal(filtered.status, 200);
  assert.ok(filtered.body.bookings.every((item: { status: string }) => item.status === 'scheduled'));
  assert.ok(filtered.body.bookings.some((item: { id: string }) => item.id === created.body.booking.id));
  assert.ok(filtered.body.summary.total > filtered.body.bookings.length);
});

test('booking lookup distinguishes a missing record from a database failure', async () => {
  const findOne = mock.fn(async (_filter: object): Promise<unknown> => null);
  useCollection('bookings', { findOne });
  assert.deepEqual(await request('/booking/missing'), {
    status: 404, body: { error: 'Booking not found' },
  });
  assert.deepEqual(findOne.mock.calls[0].arguments, [{ id: 'missing' }]);
  findOne.mock.mockImplementation(async () => { throw new Error('storage failure'); });
  assert.deepEqual(await request('/booking/missing'), {
    status: 500, body: { error: 'Failed to fetch booking' },
  });
});

const history = {
  sessionId: 'session-test',
  customerId: 'customer-test',
  customerName: 'Test Customer',
  customerEmail: 'customer@example.com',
  messages: [{ id: 'message-1', role: 'user', content: 'Book a service', timestamp: '2030-01-01T10:00:00.000Z' }],
  startTime: '2030-01-01T10:00:00.000Z',
  lastActivity: '2030-01-01T10:01:00.000Z',
};

for (const [label, upsertedId] of [['created', 'new-id'], ['updated', null]] as const) {
  test(`chat history is ${label} by session ID with validated metadata`, async () => {
    const updateOne = mock.fn(async (..._args: unknown[]) => ({ upsertedId }));
    useCollection('chatHistory', { updateOne });
    const result = await request('/chat-history', 'POST', { ...history, messageCount: 999, updatedAt: 'forged' });
    assert.deepEqual(result, {
      status: 200,
      body: { success: true, message: `Chat history ${label}`, sessionId: history.sessionId },
    });
    assert.equal(updateOne.mock.callCount(), 1);
    const [filter, update, options] = updateOne.mock.calls[0].arguments as [object, { $set: Record<string, unknown> }, object];
    assert.deepEqual(filter, { sessionId: history.sessionId });
    assert.deepEqual(options, { upsert: true });
    assert.deepEqual(update.$set, {
      ...history, status: 'completed', messageCount: 1, updatedAt: update.$set.updatedAt,
    });
    assert.ok(Number.isFinite(Date.parse(update.$set.updatedAt as string)));
  });
}

test('chat history rejects invalid emails and message roles without writing', async () => {
  const updateOne = mock.fn();
  useCollection('chatHistory', { updateOne });
  for (const invalid of [
    { ...history, customerEmail: 'not-an-email' },
    { ...history, messages: [{ ...history.messages[0], role: 'system' }] },
  ]) {
    const result = await request('/chat-history', 'POST', invalid);
    assert.equal(result.status, 400);
    assert.equal(result.body.error, 'Invalid data');
    assert.ok(result.body.details.length > 0);
  }
  assert.equal(updateOne.mock.callCount(), 0);
});

test('chat history returns service unavailable for reads, writes and deletes without a database', async () => {
  for (const [path, method, body] of [
    ['/chat-history', 'GET', undefined],
    ['/chat-history/session-test', 'GET', undefined],
    ['/chat-history', 'POST', history],
    ['/chat-history/session-test', 'DELETE', undefined],
  ] as const) {
    assert.deepEqual(await request(path, method, body), {
      status: 503, body: { error: 'Database not available' },
    });
  }
});

test('chat history reports database write failures instead of acknowledging saved data', async () => {
  useCollection('chatHistory', {
    updateOne: async () => { throw new Error('storage failure'); },
  });
  assert.deepEqual(await request('/chat-history', 'POST', history), {
    status: 500, body: { error: 'Failed to save chat history' },
  });
});

test('chat history deletion targets the session and distinguishes absent records', async () => {
  const deleteOne = mock.fn(async (_filter: object) => ({ deletedCount: 1 }));
  useCollection('chatHistory', { deleteOne });
  assert.deepEqual(await request('/chat-history/session-test', 'DELETE'), {
    status: 200, body: { success: true, message: 'Chat history deleted' },
  });
  assert.deepEqual(deleteOne.mock.calls[0].arguments, [{ sessionId: history.sessionId }]);
  deleteOne.mock.mockImplementation(async () => ({ deletedCount: 0 }));
  assert.deepEqual(await request('/chat-history/session-test', 'DELETE'), {
    status: 404, body: { error: 'Chat history not found' },
  });
});
