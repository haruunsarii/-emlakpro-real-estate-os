# 📄 EmlakPro — Frontend Developer CV & Portföy Metinleri

Bu doküman, **EmlakPro Real Estate OS** projesini özgeçmişinizde (CV), LinkedIn profilinizde veya mülakat portföy sunumlarınızda en etkili şekilde ifade etmeniz için farklı uzunluk ve formatlarda hazırlanmış profesyonel metin şablonları içerir.

---

## 📌 1. Standart CV Madde Formatı (Deneyim / Projeler Bölümü İçin)

### **EmlakPro — Real Estate OS & Agency Management Platform**
*Modern Kurumsal Gayrimenkul Yönetim Platformu (React 19, Tailwind CSS, Vite)* | [Canlı Demo Linki] | [GitHub Depo Linki]

- **React 19 & İstemci Mimarisi:** 8 ana operasyonel ekrana sahip (Dashboard, Müşteri CRM, Portföy, Alıcı Talepleri, 8 Aşamalı Kanban, Takvim & Randevu, Analitik Raporlar, Sistem Ayarları) kurumsal ölçekli bir Single Page Application (SPA) geliştirdim.
- **Reaktif Offline-First Veri Mimarisi:** Harici backend bağımlılığı olmadan, `useLocalStorage` custom hook'u ve `CustomEvent` / window `storage` mekanizmaları üzerinden tüm tarayıcı sekmeleri arasında senkronize çalışan, şema versiyonlamalı (`_v1`) reaktif bir veri katmanı tasarladım.
- **İleri Düzey Render Optimizasyonu:** `React.memo`, `useCallback` ve `useMemo` stratejileri ile gereksiz re-render'ları eledim. Büyük veri tablolarında, Kanban panosunda ve kart listelerinde tek tıkla güncelleme anında ilgisiz bileşenlerde **%100 DOM mutasyon izolasyonu (0 gereksiz DOM mutasyonu)** sağladım.
- **Dinamik Modül Yükleme & Zero CLS:** Tüm rotaları `React.lazy()` ile dinamik chunk'lara böldüm; rota tabanlı composite `PageSkeleton` ve `Suspense` entegrasyonu ile sayfa geçişlerindeki içerik zıplamalarını (Cumulative Layout Shift) tamamen sıfırladım.
- **Özel Custom Hook & UI Primitifleri:** Modal, drawer ve onay pencerelerinde `Escape` tuşu, backdrop tıklaması ve sayaçlı body scroll kilidini yöneten `useModalBehavior`; otomatik kapanma, farede duraklatma ve deduplication özellikli merkezi `useToast` kancalarını mimariye kazandırdım.
- **İstemci Taraflı PDF & Analitik Motoru:** `jsPDF` kullanarak tarayıcı üzerinde anlık gayrimenkul sunum broşürleri üreten dinamik PDF motoru ve ham veriden ciro/komisyon metrikleri türeten `reportsAggregator` veri motorunu geliştirdim.
- **Kapsamlı Test & Kalite Güvencesi:** Puppeteer ile gerçek Chromium ortamında 5 farklı ekran çözünürlüğünü (375px - 1440px) kapsayan 40'tan fazla E2E regresyon testi ve render izolasyon testleri kurguladım; projeyi Oxlint denetiminde **0 hata ve 0 uyarı** ile tamamladım.

---

## 📌 2. Kısa Özet Paragrafı (LinkedIn Proje Özeti veya CV Ön Yazı İçin)

> **EmlakPro (Real Estate OS):** Modern emlak ofislerinin CRM, portföy, Kanban satış hunisi ve analitik süreçlerini birleştiren, React 19 ve Tailwind CSS tabanlı kurumsal bir frontend web uygulamasıdır. Projede `useLocalStorage` ile sekmeler arası reaktif veri senkronizasyonu, `React.memo` ve tek geçişli $O(N)$ veri işleme algoritmalarıyla %100 DOM mutasyon izolasyonu, `React.lazy` ve composite skeleton loader'lar ile sıfır layout shift (CLS) performansı sağlanmıştır. İstemci taraflı PDF üretimi (`jsPDF`) ve Puppeteer tabanlı E2E regresyon testleriyle desteklenen platform, Oxlint statik analizinde 0 hata / 0 uyarı ile prodüksiyona hazır hale getirilmiştir.

---

## 📌 3. Öne Çıkan Teknik Beceriler Matrisi

Özgeçmişinizin "Teknik Yetkinlikler" bölümünde bu projeye atıfta bulunabileceğiniz anahtar kavramlar:

| Kategori | Bu Projede Uygulanan Pratik |
|---|---|
| **Frontend Framework** | React 19 (Hooks, Concurrent Mode, React.lazy, Suspense, ErrorBoundary) |
| **Routing** | React Router DOM v7 (SPA Client Routing, Nested Layouts, Wildcard redirects) |
| **State & Persistence** | Custom Hooks (`useLocalStorage`), Window Storage Events, CustomEvents, Versioned Schemas |
| **Stil & Arayüz** | Tailwind CSS v3 (Utility-first, Mobile-first, Custom Design Tokens, CSS Grid, Flexbox) |
| **Performans Optimizasyonu** | `React.memo`, `useCallback`, `useMemo`, Single-pass $O(N)$ Data Aggregation, Zero Layout Shift |
| **Erişilebilirlik & UX** | ARIA Roles (`status`, `alert`, `dialog`), Keyboard Navigation (`Escape`, `Ctrl+K`), Focus Management |
| **Dokümantasyon & PDF** | İstemci taraflı dinamik PDF üretimi (`jsPDF`), Türkçe karakter normalizasyon algoritmaları |
| **Test & Kalite** | Puppeteer Core E2E otomasyonu, Responsive Viewport Regression, Oxlint linter (0 warnings) |
| **Build & Tooling** | Vite v8, ES Modules, Rollup Chunking, Vercel & Netlify SPA Routing |

---

> [!IMPORTANT]
> **Mülakat Notu:** EmlakPro'nun backend'siz, saf bir frontend mühendislik projesi olduğunu vurgulayın. Mülakatlarda verilerin localStorage üzerinde nasıl reaktif senkronize edildiğini, DOM mutasyon izolasyonunun nasıl ölçüldüğünü ve React render optimizasyonlarının nasıl kurgulandığını anlatmanız, güçlü bir frontend mimarı profili çizecektir.

