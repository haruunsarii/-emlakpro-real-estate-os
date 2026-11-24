import puppeteer from 'puppeteer-core';
import {
  formatPhoneNumber,
  isValidPhone,
  isValidEmail,
  isNonEmpty,
  isPositiveNumber,
  validateBudgetRange,
  isValidTimeRange,
} from './src/utils/validation.js';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

async function runUnitTests() {
  console.log('\n--- 1. Validation Utilities Unit Tests ---');

  // Phone formatting
  assert(formatPhoneNumber('05321234567') === '0 (532) 123 45 67', 'Format standard 11 digits phone');
  assert(formatPhoneNumber('5321234567') === '0 (532) 123 45 67', 'Format 10 digits phone automatically prepending 0');
  assert(formatPhoneNumber('905321234567') === '0 (532) 123 45 67', 'Format phone with 90 country code prefix');

  // Phone validity
  assert(isValidPhone('05321234567') === true, 'Valid raw 05321234567');
  assert(isValidPhone('0 (532) 123 45 67') === true, 'Valid formatted 0 (532) 123 45 67');
  assert(isValidPhone('+90 532 123 45 67') === true, 'Valid +90 format');
  assert(isValidPhone('12345') === false, 'Invalid short phone');
  assert(isValidPhone('02123456789') === false, 'Invalid non-mobile Turkish phone starting with 0212');
  assert(isValidPhone('') === false, 'Invalid empty phone');

  // Email validity
  assert(isValidEmail('burak@emlakpro.com') === true, 'Valid email burak@emlakpro.com');
  assert(isValidEmail('user.name+tag@sub.domain.co') === true, 'Valid complex email');
  assert(isValidEmail('plainaddress') === false, 'Invalid plain address');
  assert(isValidEmail('@missingusername.com') === false, 'Invalid missing username');
  assert(isValidEmail('user@.com') === false, 'Invalid missing domain name');

  // Non-empty
  assert(isNonEmpty('Hello') === true, 'Valid non-empty');
  assert(isNonEmpty('   ') === false, 'Whitespace only is rejected');
  assert(isNonEmpty('A', 2) === false, 'Min length check enforced');

  // Positive numbers
  assert(isPositiveNumber(1500) === true, '1500 is positive');
  assert(isPositiveNumber('25000000') === true, 'String number 25000000 is positive');
  assert(isPositiveNumber(0) === false, '0 is not positive when min default is 1');
  assert(isPositiveNumber(-50) === false, '-50 is rejected');
  assert(isPositiveNumber('abc') === false, 'NaN is rejected');

  // Budget Range
  assert(validateBudgetRange(1000000, 2000000).isValid === true, 'Valid budget 1M - 2M');
  assert(validateBudgetRange(5000000, 2000000).isValid === false, 'Invalid budget: min > max rejected');
  assert(validateBudgetRange(-10, 100).isValid === false, 'Negative min budget rejected');

  // Time Range
  assert(isValidTimeRange('10:00', '11:30') === true, 'Valid time range 10:00 to 11:30');
  assert(isValidTimeRange('14:30', '12:00') === false, 'Invalid time range: start after end rejected');
  assert(isValidTimeRange('10:00', '10:00') === false, 'Invalid time range: equal start/end rejected');
}

async function runBrowserTests() {
  console.log('\n--- 2. Browser Puppeteer Modal & Form Validation Tests ---');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // 1. Dashboard QuickActionModal ESC & Backdrop Test
    console.log('Navigating to Dashboard...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

    // Open quick action modal for musteri
    await page.evaluate(() => {
      // Find "Yeni Müşteri Ekle" or "Hızlı Müşteri" button or quick actions
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Yeni Müşteri Ekle') || b.innerText.includes('Müşteri Ekle'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    // Check modal is open and body scroll is locked
    const isLocked = await page.evaluate(() => document.body.style.overflow === 'hidden');
    assert(isLocked, 'Body scroll is locked (overflow: hidden) when modal opens');

    // Test ESC key closes modal
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 600));

    const isUnlockedAfterEsc = await page.evaluate(() => document.body.style.overflow !== 'hidden');
    assert(isUnlockedAfterEsc, 'ESC key closed modal and restored body scroll');

    // 2. Customers Page Modal Validation & Phone Masking
    console.log('Navigating to Customers page...');
    await page.goto('http://localhost:5173/musteriler', { waitUntil: 'networkidle2' });

    // Open "Yeni Müşteri Ekle"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Yeni Müşteri Ekle'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    // Try submitting empty form
    await page.evaluate(() => {
      const submitBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim() === 'Kaydet');
      if (submitBtn) submitBtn.click();
    });

    await new Promise((r) => setTimeout(r, 400));

    // Check for inline error messages
    const errorTexts = await page.evaluate(() => {
      const errNodes = Array.from(document.querySelectorAll('.text-error'));
      return errNodes.map((n) => n.innerText);
    });

    assert(
      errorTexts.some((t) => t.includes('Müşteri adı en az 2 karakter')),
      'Name validation error displayed on empty submit'
    );
    assert(
      errorTexts.some((t) => t.includes('Geçerli bir Türkiye cep telefonu giriniz')),
      'Phone validation error displayed on empty submit'
    );

    // Test Phone Masking as user types
    await page.evaluate(() => {
      const phoneInput = document.querySelector('input[type="tel"]');
      if (phoneInput) {
        // simulate typing 05329876543
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        ).set;
        nativeInputValueSetter.call(phoneInput, '05329876543');
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await new Promise((r) => setTimeout(r, 300));

    const maskedPhone = await page.evaluate(() => {
      const phoneInput = document.querySelector('input[type="tel"]');
      return phoneInput ? phoneInput.value : '';
    });

    assert(
      maskedPhone === '0 (532) 987 65 43',
      `Phone input automatically masked: "${maskedPhone}"`
    );

    // Test Backdrop Click closes modal
    await page.evaluate(() => {
      // Find the fixed outer backdrop
      const backdrop = document.querySelector('.fixed.inset-0.z-50');
      if (backdrop) {
        // click on backdrop itself
        backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });

    await new Promise((r) => setTimeout(r, 600));
    const modalClosedAfterBackdrop = await page.evaluate(() => !document.querySelector('.fixed.inset-0.z-50'));
    assert(modalClosedAfterBackdrop, 'Clicking backdrop closed the modal');

    // 3. Properties Page ESC and Form Check
    console.log('Navigating to Properties page...');
    await page.goto('http://localhost:5173/gayrimenkuller', { waitUntil: 'networkidle2' });

    // Click "Yeni Portföy Ekle"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Yeni Portföy Ekle'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 600));
    assert(
      await page.evaluate(() => Boolean(document.querySelector('form'))),
      'PropertyFormModal is opened'
    );

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 600));

    assert(
      await page.evaluate(() => !document.querySelector('form')),
      'PropertyFormModal closed on ESC key'
    );

    // 4. Deals Page ESC and Customer Sync Check
    console.log('Navigating to Deals page (satis-ve-kiralama)...');
    await page.goto('http://localhost:5173/satis-ve-kiralama', { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Yeni Fırsat'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    // Verify customer dropdown has loaded customers inside the modal form
    const customerOptionsCount = await page.evaluate(() => {
      const form = document.querySelector('.fixed.inset-0.z-50 form');
      if (!form) return 0;
      const select = form.querySelector('select');
      return select ? select.options.length : 0;
    });

    assert(customerOptionsCount > 1, `DealFormModal loaded ${customerOptionsCount - 1} customers in dropdown`);

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 600));

    assert(
      await page.evaluate(() => !document.querySelector('.fixed.inset-0.z-50')),
      'DealFormModal closed on ESC key'
    );

    // 5. Tasks Page ESC Check
    console.log('Navigating to Tasks page (gorevler-ve-randevular)...');
    await page.goto('http://localhost:5173/gorevler-ve-randevular', { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find((b) => b.innerText.includes('Yeni Randevu'));
      if (btn) btn.click();
    });

    await new Promise((r) => setTimeout(r, 600));

    assert(
      await page.evaluate(() => Boolean(document.querySelector('.fixed.inset-0.z-50'))),
      'AppointmentFormModal is open'
    );

    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 600));

    assert(
      await page.evaluate(() => !document.querySelector('.fixed.inset-0.z-50')),
      'AppointmentFormModal closed on ESC key'
    );

    console.log('\n======================================================');
    console.log('All Browser & Modal Verification Checks PASSED cleanly!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

async function main() {
  await runUnitTests();
  await runBrowserTests();
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
