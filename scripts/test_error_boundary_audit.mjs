import React from 'react';
import { renderToString } from 'react-dom/server';
import ErrorBoundary from '../src/components/ui/ErrorBoundary.jsx';
import ErrorState from '../src/components/ui/ErrorState.jsx';
import EmptyState from '../src/components/ui/EmptyState.jsx';
import Skeleton from '../src/components/ui/Skeleton.jsx';

console.log('🧪 ErrorBoundary & ErrorState & EmptyState Birim Denetimi Başlatılıyor...\n');

let allPassed = true;
function record(name, passed, detail = '') {
  if (passed) {
    console.log(`  ✓ ${name} ${detail ? '(' + detail + ')' : ''}`);
  } else {
    console.error(`  ✗ ${name} - BAŞARISIZ! ${detail}`);
    allPassed = false;
  }
}

// 1. ErrorState Render Denetimi
console.log('--- 1. ErrorState Bileşen Denetimi ---');
const errorHtml = renderToString(
  React.createElement(ErrorState, {
    title: 'Özel Hata Başlığı',
    description: 'Kullanıcı dostu hata metni',
    onRetry: () => { },
    retryLabel: 'Yeniden Dene',
  })
);

record('ErrorState role="alert" barındırıyor', errorHtml.includes('role="alert"'));
record('ErrorState başlık ve açıklamayı render ediyor', errorHtml.includes('Özel Hata Başlığı') && errorHtml.includes('Kullanıcı dostu hata metni'));
record('ErrorState "Yeniden Dene" butonunu içeriyor', errorHtml.includes('Yeniden Dene'));
record('ErrorState teknik stack trace sızdırmıyor', !errorHtml.includes('Error: ') && !errorHtml.includes('at '));

// 2. ErrorBoundary Sınıf Denetimi
console.log('\n--- 2. ErrorBoundary Mekanizma Denetimi ---');
const errorObj = new Error('Simüle edilmiş render hatası');
const derivedState = ErrorBoundary.getDerivedStateFromError(errorObj);
record('ErrorBoundary getDerivedStateFromError hasError: true dönüyor', derivedState.hasError === true);
record('ErrorBoundary getDerivedStateFromError error nesnesini saklıyor', derivedState.error === errorObj);

// Mock instance test
const boundary = new ErrorBoundary({});
boundary.state = { hasError: true, error: errorObj };
let resetCalled = false;
boundary.setState = (updater) => {
  if (typeof updater === 'object' && updater.hasError === false) {
    resetCalled = true;
    boundary.state = updater;
  }
};
boundary.handleReset();
record('ErrorBoundary handleReset state sıfırlıyor (hasError: false)', resetCalled && boundary.state.hasError === false);

// 3. EmptyState Preset ve Compact Denetimi
console.log('\n--- 3. EmptyState Preset & Compact Mod Denetimi ---');
const searchEmptyHtml = renderToString(
  React.createElement(EmptyState, {
    type: 'search',
    onAction: () => { },
  })
);
record('EmptyState search preset başlığı doğru', searchEmptyHtml.includes('Aramanızla Eşleşen Kayıt Bulunamadı'));
record('EmptyState search preset "Aramayı Temizle" butonunu içeriyor', searchEmptyHtml.includes('Aramayı Temizle'));

const filterEmptyHtml = renderToString(
  React.createElement(EmptyState, {
    type: 'filter',
    onAction: () => { },
  })
);
record('EmptyState filter preset başlığı doğru', filterEmptyHtml.includes('Kriterlere Uygun Sonuç Bulunamadı'));
record('EmptyState filter preset "Filtreleri Sıfırla" butonunu içeriyor', filterEmptyHtml.includes('Filtreleri Sıfırla'));

const compactEmptyHtml = renderToString(
  React.createElement(EmptyState, {
    type: 'empty',
    compact: true,
    title: 'Kompakt Boş',
  })
);
record('EmptyState compact modu render ediliyor', compactEmptyHtml.includes('Kompakt Boş'));

// 4. Skeleton Base Atom Denetimi
console.log('\n--- 4. Skeleton Atom Denetimi ---');
const skeletonHtml = renderToString(
  React.createElement(Skeleton, {
    className: 'h-6 w-32',
  })
);
record('Skeleton aria-busy="true" içeriyor', skeletonHtml.includes('aria-busy="true"'));
record('Skeleton role="status" içeriyor', skeletonHtml.includes('role="status"'));
record('Skeleton animate-pulse sınıfı içeriyor', skeletonHtml.includes('animate-pulse'));

console.log(`\n========================================`);
console.log(`📋 BİRİM ENTEGRASYON SONUCU: ${allPassed ? '✅ TÜM DENETİMLER BAŞARILI' : '❌ HATALAR MEVCUT'}`);
console.log(`========================================\n`);

if (!allPassed) {
  process.exit(1);
}

