// Deep behavioral test for real Appointments (time-slot booking) — availability listing,
// booking, the concurrency double-booking guard, cancellation restoring the slot, and the new
// APPOINTMENTS permission section. Run against the live backend + Postgres.

const BASE = process.env.API_BASE ?? 'http://localhost:8081';
const ts = Date.now();

let failures = 0;
function check(label, condition) {
  if (condition) console.log(`  OK   ${label}`);
  else { console.log(`  FAIL ${label}`); failures++; }
}

async function post(path, body, token, { expectFail = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok && !expectFail) throw new Error(`POST ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return { ok: res.ok, status: res.status, data: json.data, message: json.message };
}

async function put(path, body, token, { expectFail = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok && !expectFail) throw new Error(`PUT ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return { ok: res.ok, status: res.status, data: json.data, message: json.message };
}

async function get(path, token, { expectFail = false } = {}) {
  const res = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const json = await res.json();
  if (!res.ok && !expectFail) throw new Error(`GET ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return { ok: res.ok, status: res.status, data: json.data, message: json.message };
}

async function del(path, token, { expectFail = false } = {}) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok && !expectFail) throw new Error(`DELETE ${path} -> ${res.status}: ${JSON.stringify(json)}`);
  return { ok: res.ok, status: res.status, message: json.message };
}

async function run() {
  console.log(`Appointments deep test against ${BASE}\n`);

  const slug = `appt-deep-${ts}`;
  const owner = await post('/api/auth/register-phone', {
    phone: `+1222${ts}`.slice(0, 15),
    fullName: 'Appt Deep Owner',
    shopName: 'Appt Deep Shop',
    password: 'StrongPass123!',
  });
  const ownerToken = owner.data.accessToken;

  const store = await post('/api/dashboard/stores', {
    name: 'Appt Deep Shop', slug, categorySlug: 'services', templateKey: 'services-hub',
  }, ownerToken);
  const storeId = store.data.id;

  const product = await post('/api/dashboard/products', {
    storeId, nameEn: 'Deep Test Service', slug: 'deep-test-service', price: 50, sortOrder: 0, productType: 'SERVICE',
  }, ownerToken);
  const productId = product.data.id;

  await put(`/api/dashboard/stores/${storeId}`, {
    name: 'Appt Deep Shop', slug, categorySlug: 'services', templateKey: 'services-hub', status: 'ACTIVE',
  }, ownerToken);

  const customer = await post('/api/public/auth/register', {
    fullName: 'Appt Deep Customer', email: `appt-deep-${ts}@test.com`, password: 'StrongPass123!',
  });
  const customerToken = customer.data.accessToken;

  // ── Create slots ─────────────────────────────────────────────────────────────
  console.log('Create slots');
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const slotStart = new Date(tomorrow); slotStart.setUTCHours(10, 0, 0, 0);
  const slotEnd = new Date(tomorrow); slotEnd.setUTCHours(10, 30, 0, 0);

  const normalSlot = await post('/api/dashboard/appointment-slots', {
    storeId, startsAt: slotStart.toISOString(), endsAt: slotEnd.toISOString(), capacity: 2,
  }, ownerToken);
  check('slot created with capacity 2, bookedCount 0', normalSlot.data.capacity === 2 && normalSlot.data.bookedCount === 0);

  const raceSlotStart = new Date(tomorrow); raceSlotStart.setUTCHours(14, 0, 0, 0);
  const raceSlotEnd = new Date(tomorrow); raceSlotEnd.setUTCHours(14, 30, 0, 0);
  const raceSlot = await post('/api/dashboard/appointment-slots', {
    storeId, startsAt: raceSlotStart.toISOString(), endsAt: raceSlotEnd.toISOString(), capacity: 1,
  }, ownerToken);

  const pastSlot = await post('/api/dashboard/appointment-slots', {
    storeId, startsAt: new Date(Date.now() - 3600_000).toISOString(), endsAt: new Date(Date.now() - 1800_000).toISOString(), capacity: 1,
  }, ownerToken);

  // ── Validation: end before start rejected ───────────────────────────────────
  const badSlot = await post('/api/dashboard/appointment-slots', {
    storeId, startsAt: slotEnd.toISOString(), endsAt: slotStart.toISOString(), capacity: 1,
  }, ownerToken, { expectFail: true });
  check('end-before-start slot rejected with 400', badSlot.status === 400);

  // ── Public: only future, active, non-full slots ─────────────────────────────
  console.log('\nPublic upcoming slots — excludes past slot');
  const publicSlots = await get(`/api/public/stores/${slug}/appointment-slots`);
  check('normal slot listed', publicSlots.data.some(s => s.id === normalSlot.data.id));
  check('race slot listed', publicSlots.data.some(s => s.id === raceSlot.data.id));
  check('past slot NOT listed', !publicSlots.data.some(s => s.id === pastSlot.data.id));

  // ── Happy path booking ───────────────────────────────────────────────────────
  console.log('\nHappy path — customer books the normal slot');
  const booking = await post(`/api/public/stores/${slug}/appointments`, {
    slotId: normalSlot.data.id, productId, customerName: 'Appt Deep Customer', customerPhone: '+15559990003',
  }, customerToken);
  check('appointment confirmed', booking.data.status === 'CONFIRMED');
  check('appointment carries slot time', booking.data.slotStartsAt === normalSlot.data.startsAt);
  check('appointment carries product name', booking.data.productName === 'Deep Test Service');

  const slotAfterBooking = await get(`/api/dashboard/appointment-slots?storeId=${storeId}`, ownerToken);
  const normalSlotAfter = slotAfterBooking.data.find(s => s.id === normalSlot.data.id);
  check('slot bookedCount incremented to 1', normalSlotAfter.bookedCount === 1);

  // ── Booking a past slot rejected ─────────────────────────────────────────────
  const pastBooking = await post(`/api/public/stores/${slug}/appointments`, {
    slotId: pastSlot.data.id, customerName: 'Appt Deep Customer', customerPhone: '+15559990003',
  }, customerToken, { expectFail: true });
  check('booking a past slot rejected with 400', pastBooking.status === 400);

  // ── Concurrency: capacity:1 slot, two simultaneous bookings ─────────────────
  console.log('\nConcurrency — capacity:1 slot, two simultaneous bookings');
  const raceRequest = () => fetch(`${BASE}/api/public/stores/${slug}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({ slotId: raceSlot.data.id, customerName: 'Appt Deep Customer', customerPhone: '+15559990003' }),
  });
  const [raceA, raceB] = await Promise.all([raceRequest(), raceRequest()]);
  const successes = [raceA, raceB].filter(r => r.ok).length;
  check('exactly one of the two concurrent bookings succeeded', successes === 1);

  const raceSlotAfter = (await get(`/api/dashboard/appointment-slots?storeId=${storeId}`, ownerToken))
    .data.find(s => s.id === raceSlot.data.id);
  check('race slot bookedCount is exactly 1 (not 2)', raceSlotAfter.bookedCount === 1);

  // ── Deleting a slot with bookings is blocked ─────────────────────────────────
  const blockedDelete = await del(`/api/dashboard/appointment-slots/${normalSlot.data.id}`, ownerToken, { expectFail: true });
  check('deleting a slot with bookings is blocked (400)', blockedDelete.status === 400);

  // ── Cancellation restores the slot ───────────────────────────────────────────
  console.log('\nCancelling an appointment restores the slot');
  const dashAppointments = await get(`/api/dashboard/appointments?storeId=${storeId}`, ownerToken);
  const toCancel = dashAppointments.data.find(a => a.slotId === normalSlot.data.id);
  const cancelled = await put(`/api/dashboard/appointments/${toCancel.id}/status`, { status: 'CANCELLED' }, ownerToken);
  check('status updated to CANCELLED', cancelled.data.status === 'CANCELLED');

  const slotAfterCancel = (await get(`/api/dashboard/appointment-slots?storeId=${storeId}`, ownerToken))
    .data.find(s => s.id === normalSlot.data.id);
  check('slot bookedCount restored to 0', slotAfterCancel.bookedCount === 0);

  // Now deleting that slot should succeed (no bookings left).
  const nowDeletable = await del(`/api/dashboard/appointment-slots/${normalSlot.data.id}`, ownerToken);
  check('slot with zero bookings can now be deleted', nowDeletable.ok);

  // ── Permissions: APPOINTMENTS behaves like every other section ──────────────
  console.log('\nAPPOINTMENTS permission section');
  const staffEmail = `appt-deep-staff-${ts}@test.com`;
  await post('/api/dashboard/staff/invite', { storeId, email: staffEmail, fullName: 'Appt Deep Staff' }, ownerToken);
  await new Promise(r => setTimeout(r, 500));
  const fs = await import('node:fs');
  const logText = fs.readFileSync('C:\\Users\\user\\AppData\\Local\\Temp\\claude\\c--Users-user-Desktop-shop\\7db3403d-35bd-4915-ab92-a1318b4d93a2\\scratchpad\\backend6.log', 'utf8');
  const tokenMatch = [...logText.matchAll(new RegExp(`DEV staff invite token for ${staffEmail}: (\\S+)`, 'g'))].pop();
  const staffAuth = await post('/api/public/staff/accept-invite', { token: tokenMatch[1], fullName: 'Appt Deep Staff', password: 'StrongPass123!' });
  const staffToken = staffAuth.data.accessToken;
  const staffUserId = staffAuth.data.user.id;

  const myPerms = await get('/api/dashboard/staff/me/permissions', staffToken);
  const apptPerm = myPerms.data.find(g => g.section === 'APPOINTMENTS');
  check('APPOINTMENTS defaults to EDIT for fresh staff', apptPerm.level === 'EDIT');

  const staffCanCreateSlot = await post('/api/dashboard/appointment-slots', {
    storeId, startsAt: new Date(Date.now() + 48 * 3600_000).toISOString(), endsAt: new Date(Date.now() + 49 * 3600_000).toISOString(),
  }, staffToken);
  check('staff can create a slot by default (EDIT)', !!staffCanCreateSlot.data.id);

  await put(`/api/dashboard/staff/${staffUserId}/permissions`, { grants: [{ section: 'APPOINTMENTS', level: 'NONE' }] }, ownerToken);
  const blockedList = await get(`/api/dashboard/appointments?storeId=${storeId}`, staffToken, { expectFail: true });
  check('staff listing appointments now 403s (NONE)', blockedList.status === 403);

  console.log(`\n${failures === 0 ? 'ALL APPOINTMENTS CHECKS OK' : `${failures} CHECK(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

run().catch(e => {
  console.error('\nSCRIPT ERROR:', e.message);
  process.exit(2);
});
