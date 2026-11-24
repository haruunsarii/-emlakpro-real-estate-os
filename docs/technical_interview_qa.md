# 🧠 EmlakPro — Frontend Teknik Mülakat Soru & Cevap Dokümanı

Bu doküman, bir teknik mülakatta **EmlakPro** projesi üzerinden gelebilecek olası frontend mimarisi ve React sorularını; projedeki somut kod uygulamaları, tasarım kararları ve ölçüm sonuçlarıyla yanıtlamanız için hazırlanmıştır.

---

## 📑 Soru Başlıkları

1. [React Bileşen Mimarisi & Klasörleme](#1-react-bileşen-mimarisi--klasörleme)
2. [useState ve useEffect Doğru Kullanımı](#2-usestate-ve-useeffect-doğru-kullanımı)
3. [useMemo ve useCallback: Ne Zaman ve Neden?](#3-usememo-ve-usecallback-ne-zaman-ve-neden)
4. [React.memo ve DOM Mutasyon İzolasyonu](#4-reactmemo-ve-dom-mutasyon-izolasyonu)
5. [Özel Kancalar (Custom Hooks) Tasarımı](#5-özel-kancalar-custom-hooks-tasarımı)
6. [LocalStorage ile Reaktif ve Çoklu Sekme Senkronizasyonu](#6-localstorage-ile-reaktif-ve-çoklu-sekme-senkronizasyonu)
7. [React Router, Rota Koruması ve Kod Bölme (Lazy Loading)](#7-react-router-rota-koruması-ve-kod-bölme-lazy-loading)
8. [Responsive Tasarım ve Taşma Koruması](#8-responsive-tasarım-ve-taşma-koruması)
9. [Modal ve Drawer Mimarisi (Scroll Lock & A11y)](#9-modal-ve-drawer-mimarisi-scroll-lock--a11y)
10. [Hata Yönetimi ve ErrorBoundary Kalkanı](#10-hata-yönetimi-ve-errorboundary-kalkanı)

---

### 1. React Bileşen Mimarisi & Klasörleme

**Soru:** *EmlakPro gibi 8 büyük ekranlı ve yoğun etkileşimli bir projede bileşen hiyerarşisini ve dosya yapısını nasıl kurguladınız?*

**Cevap:**
- Projede **Feature-Based (Modüler)** ve **Atomic UI** yaklaşımlarını birleştirdim.
- `src/components/` altında her alan kendi klasörüne ayrıldı (`customers/`, `properties/`, `deals/`, `tasks/`, `reports/`, `settings/`, `dashboard/`).
- Ortak atomlar (`BaseDrawer`, `ConfirmDeleteModal`, `Toast`, `Skeleton`) `src/components/ui/` dizininde toplandı.
- Sayfa bileşenleri (`src/pages/`) yalnızca layout düzenleme, context/hook bağlama ve prop dağıtma görevini üstlendi; iş mantığı (business logic) `services/reportsAggregator.js` ve custom hook'lara delege edildi.
- Bu ayrım, modüller arasındaki bağımlılıkları (coupling) azalttı ve kodun test edilebilirliğini artırdı.

---

### 2. useState ve useEffect Doğru Kullanımı

**Soru:** *`useEffect` kullanımında en sık yapılan hatalar nelerdir ve EmlakPro'da bunlardan nasıl kaçındınız?*

**Cevap:**
- **Kademeli Render Hatası (`set-state-in-effect`):** En yaygın hata, bir prop veya filtre değiştiğinde sayfa numarasını sıfırlamak için `useEffect` içinde `setCurrentPage(1)` çalıştırmaktır. Bu durum gereksiz bir ek render döngüsüne yol açar ve linter tarafından uyarılır.
- **EmlakPro Çözümü:** Sayfa sıfırlama işlemini `useEffect` yerine doğrudan eylemin gerçekleştiği olay yöneticilerine (`handleFilterChange`, `handleSearchChange`) taşıdım. Böylece filtreleme ve sayfa sıfırlama tek bir render döngüsünde gerçekleşti.
- **Render Saflığı (Purity):** `new Date()` veya `Date.now()` gibi fonksiyonların render gövdesinde doğrudan çağrılması React derleyicisinin saflık kuralını bozar. Projede bu değerler `useState(() => new Date())` gibi tembel ilklendiricilerle (lazy initializer) sabitlendi.

---

### 3. useMemo ve useCallback: Ne Zaman ve Neden?

**Soru:** *Her fonksiyonu `useCallback`, her değişkeni `useMemo` ile sarmalamak doğru mudur? EmlakPro'da optimizasyon sınırını nasıl çizdiniz?*

**Cevap:**
- Hayır, gereksiz memoization bellek maliyeti ve karşılaştırma yükü getirir. Memoization yalnızca iki durumda anlamlıdır:
  1. Alt bileşen `React.memo` ile sarılmışsa ve fonksiyon referansının değişmemesi gerekiyorsa (`useCallback`).
  2. Hesaplama maliyeti yüksekse veya referans eşitliği bozulduğunda pahalı alt ağaçlar tetikleniyorsa (`useMemo`).
- **EmlakPro Somut Örneği:**
  - **Kanban Pano Gruplaması:** 8 aşama için her render'da 8 kez `deals.filter()` çalıştırmak yerine, tek döngüde $O(N)$ karmaşıklıkla `dealsByStage` nesnesini oluşturan tek bir `useMemo([deals])` kurguladım.
  - **Spline Gelir Grafiği:** `RevenueChartCard` bileşeninde fare grafiğin üzerinde gezindiğinde (`hoveredIndex` değiştiğinde) kübik Bezier eğri koordinatlarının tekrar hesaplanmasını `useMemo([data, maxValue])` ile engelledim.

---

### 4. React.memo ve DOM Mutasyon İzolasyonu

**Soru:** *`React.memo` bileşenlerin yeniden render edilmesini nasıl engeller ve bu optimizasyonun gerçekten çalıştığını nasıl kanıtladınız?*

**Cevap:**
- `React.memo`, bileşene gelen prop'ları shallow-compare (yüzeysel karşılaştırma) yöntemiyle kontrol eder. Prop referansları değişmediği sürece bileşenin render fonksiyonunu çalıştırmaz.
- **Ölçüm ve Kanıt (Puppeteer MutationObserver):**
  - Optimizasyonun başarısını göz kararı değil, Puppeteer test scriptlerinde `MutationObserver` çalıştırarak kanıtladım.
  - Örneğin `/gayrimenkuller` ekranında 15 kart varken, bir kartın favori butonuna basıldığında hedef kartta 1 DOM mutasyonu oluşurken, diğer 14 kartta **EXACTLY 0 DOM mutasyonu (%100 izolasyon)** sağlandığını otomasyon testleriyle doğruladım (`test_properties_render_optimization.mjs`).

---

### 5. Özel Kancalar (Custom Hooks) Tasarımı

**Soru:** *Projede geliştirdiğiniz `useModalBehavior` kancasının amacı ve çözdüğü problemler nelerdir?*

**Cevap:**
- EmlakPro'da 10'dan fazla modal ve drawer bulunmaktadır. Her bileşende ayrı ayrı klavye dinleyicisi veya scroll kilidi yazmak kod tekrarına ve bellek sızıntılarına (memory leak) yol açardı.
- **`useModalBehavior({ isOpen, onClose })` Çözümü:**
  - `Escape` tuşuna basıldığında animasyonlu kapanmayı tetikler.
  - Dış karartılmış arka plana (backdrop) tıklandığında iç içeriğin tıklamasını izole ederek (`stopPropagation`) kapatır.
  - **Sayaçlı Scroll Lock:** Çoklu overlay durumlarında `document.body.style.overflow = 'hidden'` kilit sayacını artırır ve tüm pencereler kapandığında sayfa kaydırmasını pürüzsüzce geri yükler.

---

### 6. LocalStorage ile Reaktif ve Çoklu Sekme Senkronizasyonu

**Soru:** *Standart `localStorage` yalnızca string tutar ve React state'ini otomatik güncellemez. `useLocalStorage` kancanızda reaktiviteyi ve sekmeler arası iletişimi nasıl kurdunuz?*

**Cevap:**
- **Reaktif State:** Kanca içerisinde React `useState` tanımlayarak ilk değeri `localStorage.getItem(key)` ile başlattım.
- **Bileşenler Arası Senkronizasyon:** Aynı sekmede farklı bileşenlerin depolama güncellemelerinden anında haberdar olması için `setStoredValue` çağrıldığında `window.dispatchEvent(new CustomEvent('emlakpro_local_storage_sync', { detail: { key, value } }))` tetikledim.
- **Farklı Sekmeler Arası Senkronizasyon:** Tarayıcının yerel `window.addEventListener('storage', ...)` olayını dinleyerek bir sekmede yapılan portföy silme veya müşteri düzenleme işleminin diğer sekmedeki UI'a sayfa yenilenmeden anında yansımasını sağladım.
- **Hata ve Şema Güvenliği:** Bozuk JSON veya geçersiz depolama verilerinde çökme yaşanmaması için `try/catch` blokları ve `initialValue` geri dönüş koruması entegre ettim.

---

### 7. React Router, Rota Koruması ve Kod Bölme (Lazy Loading)

**Soru:** *Projenin başlangıç yükleme süresini (Initial Load Time) düşürmek ve Cumulative Layout Shift (CLS) riskini önlemek için nasıl bir yönlendirme mimarisi kurguladınız?*

**Cevap:**
- **Route-based Code Splitting:** `AppRouter.jsx` üzerinde 8 ana sayfanın tamamını `React.lazy(() => import(...))` ile dinamik olarak ayrıştırdım. Kullanıcı Dashboard'dayken Ayarlar veya Raporlar modülünün 100+ kB'lık kodları yüklenmez.
- **Composite Skeleton Fallback:** `<Suspense fallback={<PageSkeleton />}>` yapısını kullandım. Tek tip bir spinner koymak yerine, `location.pathname`'e göre hedef sayfanın geometrisiyle birebir örtüşen skeleton layout render ettim. Bu sayede sayfa yüklendiğinde düzen zıplaması yaşanmaz (CLS = 0).
- **Wildcard & Alias:** Eski veya alternatif rotaları (`/musteri-talepleri`, `/gorevler`, `/*`) `AppRouter` seviyesinde doğru bileşene veya `/` rotasına yönlendirdim.

---

### 8. Responsive Tasarım ve Taşma Koruması

**Soru:** *8 kolonlu karmaşık bir CRM tablosunu veya 8 aşamalı bir Kanban panosunu mobil ekranda (375px) kullanılabilir kılmak için ne tür UI/UX stratejileri uyguladınız?*

**Cevap:**
- **Mobil Kart Dönüşümü:** `CustomerTable` ve `RecentTransactionsTable` bileşenlerinde Tailwind'in `hidden md:table` ve `md:hidden flex flex-col` sınıflarını kullandım. Masaüstünde 8 kolonlu veri zenginliği korunurken, mobilde her satır tek parmakla dokunulabilir bir karta dönüşür (doğrudan arama ve WhatsApp butonları ile).
- **Kanban Yatay Kaydırma & Navigatör:** 8 aşamalı Kanban panosu mobilde `overflow-x-auto snap-x` ile sarmalandı ve sayfanın en üstüne 8 aşama hap navigatörü (`KanbanMobileNavigator`) eklendi. Kullanıcı tek tıkla "Pazarlık" veya "Sözleşme" sütununa pürüzsüzce odaklanabilir.
- **0px Yatay Taşma:** 5 farklı ekran genişliğinde (375px, 390px, 768px, 1024px, 1440px) 40 kontrol noktası Puppeteer ile test edilmiş; hiçbir ekranda sayfa genişliğini aşan yatay taşma (`scrollWidth > clientWidth`) oluşmadığı doğrulanmıştır.

---

### 9. Modal ve Drawer Mimarisi (Scroll Lock & A11y)

**Soru:** *Erişilebilir (A11y) bir modal veya drawer bileşeni hangi HTML özniteliklerine ve davranış kurallarına sahip olmalıdır?*

**Cevap:**
- **ARIA Öznitelikleri:** Kapsayıcı dialog elementi `role="dialog"`, `aria-modal="true"` ve başlığı bağlayan `aria-labelledby` özniteliklerini taşımalıdır. Bildirimlerde ise önem derecesine göre `role="status"` veya `role="alert"` kullanılmalıdır.
- **Klavye Erişilebilirliği:** Modal açıldığında klavyeden `Escape` tuşu dinlenmeli, kapatma butonlarında `aria-label="Kapat"` açıkça belirtilmelidir.
- **Görsel Düzen:** EmlakPro'da `BaseDrawer` genişlik modları (`sm`, `md`, `lg`, `xl`) prop bazlı standardize edilmiş; footer butonları mobil cihazlarda her zaman erişilebilir kalması için `sticky bottom-0` ile sabitlenmiştir.

---

### 10. Hata Yönetimi ve ErrorBoundary Kalkanı

**Soru:** *Bir alt bileşende çalışma zamanı (runtime) JavaScript hatası oluştuğunda tüm React uygulamasının çökmesini nasıl engellediniz?*

**Cevap:**
- React'ta JavaScript çalışma zamanı hataları yakalanmazsa React ağacı unmount olur ve kullanıcı boş beyaz bir ekranla karşılaşır.
- **`ErrorBoundary` Uygulaması:**
  - `componentDidCatch` ve `getDerivedStateFromError` yaşam döngülerini içeren bir sınıf bileşeni (`ErrorBoundary.jsx`) geliştirdim.
  - `AppLayout` seviyesinde ana içerik alanını bu kalkanla sarmaladım.
  - Hata oluştuğunda konsola detaylı log yazılırken, kullanıcıya teknik hata detayları sızdırılmadan anlaşılır `ErrorState` bileşeni gösterilir ("Yeniden Dene" ve "Sayfayı Yenile" butonlarıyla). Bu sayede uygulamanın sidebar veya header gibi diğer kısımları çalışmaya devam eder.

