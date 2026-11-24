/**
 * Comprehensive Cross-Screen Data Consistency & Backup/Restore Test Suite
 */
import {
  exportAllCrmData,
  validateCrmBackup,
  restoreCrmData,
  resetCrmToFactoryDefaults,
  calculateRealSystemMetrics,
  SETTINGS_STORAGE_KEY,
  BACKUP_STORAGE_KEY,
  SAFETY_BACKUP_STORAGE_KEY,
  APP_VERSION,
} from './src/services/settingsData.js';

import {
  customersList,
  initialPropertiesList,
  initialDealsList,
  initialDemandsList,
  initialTasksList,
  initialAppointmentsList,
} from './src/services/mockData.js';

// Setup Mock Window & LocalStorage
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

global.window = {
  localStorage: new MockLocalStorage(),
  dispatchEvent: (event) => {
    // mock dispatch
    global.window._lastDispatchedEvent = event.type;
  },
};
global.localStorage = global.window.localStorage;
global.Event = class Event {
  constructor(type) {
    this.type = type;
  }
};
global.CustomEvent = class CustomEvent {
  constructor(type, params) {
    this.type = type;
    this.detail = params?.detail;
  }
};

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
  passedTests++;
}

console.log('====================================================');
console.log('EmlakPro Cross-Screen Integration & Consistency Test');
console.log('====================================================\n');

// 1. Initial State Baseline & Metrics Check
console.log('--- Test Suite 1: Initial Baseline & Metrics Accuracy ---');
window.localStorage.clear();
const initialMetrics = calculateRealSystemMetrics();
const storageMetric = initialMetrics.find((m) => m.id === 'storage');
const recordsMetric = initialMetrics.find((m) => m.id === 'records');
const portalsMetric = initialMetrics.find((m) => m.id === 'portals');
const systemMetric = initialMetrics.find((m) => m.id === 'system');

assert(storageMetric.value === '0.0 KB / ~5 MB', 'Initial storage is 0.0 KB with ~5 MB estimate');
assert(storageMetric.subBadgeValue === 'Temiz Başlangıç', 'Clean start badge shown');
const expectedInitialCount =
  customersList.length +
  initialPropertiesList.length +
  initialDealsList.length +
  initialDemandsList.length +
  initialTasksList.length +
  initialAppointmentsList.length;
assert(
  recordsMetric.value === `${expectedInitialCount} Aktif Kayıt`,
  `Records count correctly sums all 6 collections: ${expectedInitialCount}`
);
assert(!portalsMetric.isLivePulse, 'Portals metric has no fake live pulse');
assert(portalsMetric.subtitle.includes('Simülasyon'), 'Portals metric marked as simulation');
assert(systemMetric.value === APP_VERSION, `System version is ${APP_VERSION}`);

// 2. Export All CRM Data with Live LocalStorage Overrides
console.log('\n--- Test Suite 2: Export CRM Data with Live Overrides ---');
// Inject a custom customer and custom property into localStorage
const customCustomers = [...customersList, { id: 'cust-custom-99', name: 'Zeynep Kaya', email: 'zeynep@example.com' }];
const customProperties = [...initialPropertiesList, { id: 'PORT-CUSTOM-1', title: 'Kadıköy Çatı Katı', price: 15000000 }];
const customDeals = [...initialDealsList, { id: 'deal-custom-1', title: 'Kadıköy Çatı Katı Satışı', amount: 15000000 }];

window.localStorage.setItem('emlakpro_customers_v1', JSON.stringify(customCustomers));
window.localStorage.setItem('emlakpro_properties_v1', JSON.stringify(customProperties));
window.localStorage.setItem('emlakpro_deals_v1', JSON.stringify(customDeals));
// Third party key to test storage isolation
window.localStorage.setItem('other_app_user_data', JSON.stringify({ token: 'abc123secret' }));

const exportBundle = exportAllCrmData();
assert(exportBundle.schemaVersion === '2.4', 'Export bundle schemaVersion is 2.4');
assert(exportBundle.data.customers.length === customCustomers.length, 'Export includes live localStorage customers');
assert(exportBundle.data.properties.length === customProperties.length, 'Export includes live localStorage properties');
assert(exportBundle.data.deals.length === customDeals.length, 'Export includes live localStorage deals');
assert(exportBundle.data.demands.length === initialDemandsList.length, 'Export includes demands from fallback');
assert(exportBundle.data.tasks.length === initialTasksList.length, 'Export includes tasks from fallback');
assert(exportBundle.data.appointments.length === initialAppointmentsList.length, 'Export includes appointments from fallback');
assert(exportBundle.data.settings !== undefined, 'Export includes settings');
assert(
  exportBundle.metricsSummary.totalRecords ===
    customCustomers.length +
      customProperties.length +
      customDeals.length +
      initialDemandsList.length +
      initialTasksList.length +
      initialAppointmentsList.length,
  'Export metricsSummary accurately reflects total records count'
);

// 3. Storage Scoping Isolation (foreign keys must NOT be counted)
console.log('\n--- Test Suite 3: Storage Calculation Scoped Strictly to emlakpro_* ---');
const metricsWithData = calculateRealSystemMetrics();
const storageWithData = metricsWithData.find((m) => m.id === 'storage');
// Verify other_app_user_data is ignored
let expectedBytes = 0;
for (let i = 0; i < window.localStorage.length; i++) {
  const k = window.localStorage.key(i);
  if (k && k.startsWith('emlakpro_')) {
    expectedBytes += (k.length + window.localStorage.getItem(k).length) * 2;
  }
}
const expectedKb = (expectedBytes / 1024).toFixed(1);
assert(
  storageWithData.value === `${expectedKb} KB / ~5 MB`,
  `Storage calculation strictly matches emlakpro_* bytes (${expectedKb} KB)`
);

// 4. Schema Validation
console.log('\n--- Test Suite 4: Schema Validation ---');
assert(validateCrmBackup(exportBundle) === true, 'Valid 2.4 backup passes validation');

let threwUnsupported = false;
try {
  validateCrmBackup({ ...exportBundle, schemaVersion: '1.0' });
} catch (e) {
  threwUnsupported = true;
  assert(e.message.includes('Desteklenmeyen yedek sürümü'), 'Unsupported version rejected');
}
assert(threwUnsupported, 'Unsupported version threw error');

let threwMissingId = false;
try {
  validateCrmBackup({
    ...exportBundle,
    data: {
      ...exportBundle.data,
      properties: [{ title: 'No ID property' }],
    },
  });
} catch (e) {
  threwMissingId = true;
  assert(e.message.includes('Gayrimenkul listesinde'), 'Malformed property item without ID rejected');
}
assert(threwMissingId, 'Malformed property threw error');

// 5. Restore CRM Data & Safety Snapshot
console.log('\n--- Test Suite 5: Restore CRM Data & Pre-Restore Snapshot ---');
const modifiedBackup = JSON.parse(JSON.stringify(exportBundle));
modifiedBackup.data.customers.push({ id: 'cust-restored-100', name: 'Ahmet Yurt' });
modifiedBackup.data.properties.push({ id: 'PORT-RESTORED-2', title: 'Caddebostan Yalı Dairesi' });

const restoreSuccess = restoreCrmData(modifiedBackup);
assert(restoreSuccess === true, 'restoreCrmData returns true on success');

// Verify pre-restore snapshot was created in SAFETY_BACKUP_STORAGE_KEY
const safetySnapshotStr = window.localStorage.getItem(SAFETY_BACKUP_STORAGE_KEY);
assert(safetySnapshotStr !== null, 'Pre-restore safety snapshot created in localStorage');
const safetySnapshot = JSON.parse(safetySnapshotStr);
assert(safetySnapshot.customers_v1 !== null, 'Snapshot captured previous customers');
assert(safetySnapshot.properties_v1 !== null, 'Snapshot captured previous properties');

// Verify restored data in localStorage
const restoredCust = JSON.parse(window.localStorage.getItem('emlakpro_customers_v1'));
const restoredProps = JSON.parse(window.localStorage.getItem('emlakpro_properties_v1'));
assert(restoredCust.length === customCustomers.length + 1, 'Restored customers count matches backup');
assert(restoredProps.length === customProperties.length + 1, 'Restored properties count matches backup');

// 6. Atomic Rollback on Failure
console.log('\n--- Test Suite 6: Atomic Rollback on Write Failure ---');
// Simulate localStorage quota exceeded or error on deals write (fail on write, succeed on rollback)
const origSetItem = window.localStorage.setItem;
let simulateWriteError = false;
let hasFailedOnce = false;
window.localStorage.setItem = function (k, v) {
  if (simulateWriteError && !hasFailedOnce && k === 'emlakpro_deals_v1') {
    hasFailedOnce = true;
    throw new Error('QUOTA_EXCEEDED simulated write failure');
  }
  origSetItem.call(window.localStorage, k, v);
};

const badPayload = JSON.parse(JSON.stringify(modifiedBackup));
badPayload.data.customers.push({ id: 'cust-should-rollback', name: 'Rollback Tester' });
simulateWriteError = true;
hasFailedOnce = false;

let threwRollback = false;
try {
  restoreCrmData(badPayload);
} catch (e) {
  threwRollback = true;
  assert(e.message.includes('bozulmadan eski haline getirildi'), 'Rollback error message confirmed');
}
assert(threwRollback, 'Restore failure threw error');

// Reset mock setItem
simulateWriteError = false;
window.localStorage.setItem = origSetItem;

// Check that customers in localStorage were rolled back to pre-attempt count
const postRollbackCust = JSON.parse(window.localStorage.getItem('emlakpro_customers_v1'));
assert(
  postRollbackCust.length === restoredCust.length,
  'Customers successfully rolled back to pre-attempt state atomically'
);

// 7. Factory Reset Isolation & Pre-Reset Safety Snapshot
console.log('\n--- Test Suite 7: Factory Reset Isolation & Pre-Reset Snapshot ---');
// Verify third-party key exists before reset
assert(window.localStorage.getItem('other_app_user_data') !== null, 'Third-party key exists before reset');

// Execute factory reset
resetCrmToFactoryDefaults();

// Verify third-party key was NOT touched
assert(
  window.localStorage.getItem('other_app_user_data') !== null,
  'Third party key other_app_user_data remains completely untouched after factory reset'
);

// Verify operational CRM keys were cleared
assert(window.localStorage.getItem('emlakpro_customers_v1') === null, 'emlakpro_customers_v1 cleared');
assert(window.localStorage.getItem('emlakpro_properties_v1') === null, 'emlakpro_properties_v1 cleared');
assert(window.localStorage.getItem('emlakpro_deals_v1') === null, 'emlakpro_deals_v1 cleared');
assert(window.localStorage.getItem('emlakpro_requests_v1') === null, 'emlakpro_requests_v1 cleared');
assert(window.localStorage.getItem('emlakpro_tasks_v1') === null, 'emlakpro_tasks_v1 cleared');
assert(window.localStorage.getItem('emlakpro_appointments_v1') === null, 'emlakpro_appointments_v1 cleared');
assert(window.localStorage.getItem(SETTINGS_STORAGE_KEY) === null, 'SETTINGS_STORAGE_KEY cleared');

// Verify pre-reset safety snapshot was preserved!
const preResetSnapshotStr = window.localStorage.getItem(SAFETY_BACKUP_STORAGE_KEY);
assert(preResetSnapshotStr !== null, 'Pre-reset safety snapshot is preserved for disaster recovery');
const preResetSnapshot = JSON.parse(preResetSnapshotStr);
assert(preResetSnapshot.reason === 'pre-factory-reset', 'Snapshot reason recorded as pre-factory-reset');

// Post-reset metrics must show clean start
const postResetMetrics = calculateRealSystemMetrics();
const postResetStorage = postResetMetrics.find((m) => m.id === 'storage');
const postResetRecords = postResetMetrics.find((m) => m.id === 'records');
assert(postResetRecords.value === `${expectedInitialCount} Aktif Kayıt`, 'Records count reverted to baseline');

console.log('\n====================================================');
console.log(`Summary: ${passedTests} / ${totalTests} tests PASSED cleanly!`);
console.log('====================================================');
