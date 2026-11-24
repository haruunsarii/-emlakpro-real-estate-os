import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchesAnyTurkishField } from '../../utils/turkishSearch';
import { useDebounce } from '../../hooks/useDebounce';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { currentUser, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const isSearching = searchQuery.trim() !== debouncedSearchQuery.trim() && searchQuery.trim().length >= 2;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // ⌘K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
          setIsDropdownOpen(true);
        }
      }

      // Escape closes search dropdown
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        if (searchInputRef.current) {
          searchInputRef.current.blur();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-entity search across Properties, Customers, Requests, and Deals
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim() || debouncedSearchQuery.trim().length < 2) {
      return { properties: [], customers: [], demands: [], deals: [], totalCount: 0 };
    }

    const q = debouncedSearchQuery.trim();

    // 1. Properties
    let propertiesData = [];
    try {
      const saved = localStorage.getItem('emlakpro_properties_v1');
      if (saved) propertiesData = JSON.parse(saved);
    } catch {}

    const matchedProps = propertiesData
      .filter((p) =>
        matchesAnyTurkishField(
          [p.id, p.title, p.location, p.district, p.neighborhood, p.category, p.type, p.priceFormatted],
          q
        )
      )
      .slice(0, 3);

    // 2. Customers
    let customersData = [];
    try {
      const saved = localStorage.getItem('emlakpro_customers_v1');
      if (saved) customersData = JSON.parse(saved);
    } catch {}

    const matchedCustomers = customersData
      .filter((c) =>
        matchesAnyTurkishField([c.name, c.company, c.phone, c.email, c.preferredRegion, c.role, c.segment], q)
      )
      .slice(0, 3);

    // 3. Demands / Requests
    let demandsData = [];
    try {
      const saved = localStorage.getItem('emlakpro_requests_v1');
      if (saved) demandsData = JSON.parse(saved);
    } catch {}

    const matchedDemands = demandsData
      .filter((d) =>
        matchesAnyTurkishField([d.id, d.clientName, d.targetRegion, d.propertyType, d.budget, d.phone], q)
      )
      .slice(0, 2);

    // 4. Deals
    let dealsData = [];
    try {
      const saved = localStorage.getItem('emlakpro_deals_v1');
      if (saved) dealsData = JSON.parse(saved);
    } catch {}

    const matchedDeals = dealsData
      .filter((deal) =>
        matchesAnyTurkishField([deal.id, deal.title, deal.customerName, deal.propertyTitle, deal.propertyLocation], q)
      )
      .slice(0, 2);

    const totalCount =
      matchedProps.length + matchedCustomers.length + matchedDemands.length + matchedDeals.length;

    return {
      properties: matchedProps,
      customers: matchedCustomers,
      demands: matchedDemands,
      deals: matchedDeals,
      totalCount,
    };
  }, [debouncedSearchQuery]);

  const handleSelectResult = (path) => {
    navigate(path);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleClearInput = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-16 bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-low z-40 flex items-center justify-between px-3 sm:px-space-lg transition-all">
      {/* Search Input & Hamburger */}
      <div className="flex items-center gap-2 sm:gap-space-md flex-1 max-w-xl min-w-0 pr-2 relative">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface shrink-0 cursor-pointer"
          aria-label="Menüyü Aç"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Global Search Input Bar */}
        <div className="relative w-full flex items-center min-w-0">
          <span className="material-symbols-outlined absolute left-2.5 sm:left-space-md text-on-surface-variant text-[18px] sm:text-[20px] pointer-events-none">
            search
          </span>
          <input
            ref={searchInputRef}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2) setIsDropdownOpen(true);
            }}
            aria-label="Sistem Genelinde Arama"
            aria-expanded={isDropdownOpen}
            className="w-full h-[40px] pl-8 sm:pl-[40px] pr-12 sm:pr-14 bg-surface text-on-surface font-body-sm text-xs sm:text-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-low transition-all placeholder:text-outline border border-transparent focus:border-secondary truncate"
            placeholder="Gayrimenkul, müşteri veya talep ara... (⌘K)"
            type="text"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearInput}
              aria-label="Aramayı Temizle"
              className="absolute right-9 sm:right-11 text-outline hover:text-on-surface p-1 rounded-md transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}

          {/* ⌘K Badge */}
          <kbd className="hidden sm:inline-block absolute right-2.5 font-caption text-[11px] bg-surface-container text-on-surface-variant px-1.5 py-0.5 rounded border border-surface-variant/40 pointer-events-none select-none">
            ⌘K
          </kbd>
        </div>

        {/* Live Search Quick Results Dropdown */}
        {isDropdownOpen && searchQuery.trim().length >= 2 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container p-2 z-50 max-h-[420px] overflow-y-auto flex flex-col gap-2"
          >
            {isSearching ? (
              <div className="py-6 px-4 text-center text-on-surface-variant flex flex-col items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                <span className="font-caption text-[11px] text-outline">Sonuçlar aranıyor...</span>
              </div>
            ) : searchResults.totalCount === 0 ? (
              <div className="py-6 px-4 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] text-outline mb-1">
                  search_off
                </span>
                <p className="font-label-md text-xs font-semibold text-primary">
                  &quot;{searchQuery}&quot; ile eşleşen sonuç bulunamadı
                </p>
                <p className="font-caption text-[11px] text-outline mt-0.5">
                  Türkçe karakter duyarsız arama aktiftir. Farklı bir terim deneyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* 1. Portföyler */}
                {searchResults.properties.length > 0 && (
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">apartment</span>
                      <span>Gayrimenkul Portföyleri ({searchResults.properties.length})</span>
                    </div>
                    {searchResults.properties.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectResult('/gayrimenkuller')}
                        className="w-full text-left p-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={p.image}
                            alt={p.title}
                            width="32"
                            height="32"
                            loading="lazy"
                            decoding="async"
                            className="w-8 h-8 rounded object-cover shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-sm text-xs font-semibold text-primary truncate group-hover:text-secondary">
                              {p.title}
                            </span>
                            <span className="font-caption text-[11px] text-on-surface-variant truncate">
                              {p.id} • {p.location}
                            </span>
                          </div>
                        </div>
                        <span className="font-label-sm text-xs font-bold text-secondary shrink-0">
                          {p.priceFormatted}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Müşteriler */}
                {searchResults.customers.length > 0 && (
                  <div className="border-t border-surface-container/60 pt-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">group</span>
                      <span>Müşteriler ({searchResults.customers.length})</span>
                    </div>
                    {searchResults.customers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectResult('/musteriler')}
                        className="w-full text-left p-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={c.avatar}
                            alt={c.name}
                            width="28"
                            height="28"
                            loading="lazy"
                            decoding="async"
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="font-label-sm text-xs font-semibold text-primary truncate group-hover:text-secondary">
                              {c.name}
                            </span>
                            <span className="font-caption text-[11px] text-on-surface-variant truncate">
                              {c.company || c.preferredRegion} • {c.phone}
                            </span>
                          </div>
                        </div>
                        <span className="font-caption text-[10px] bg-surface-container px-2 py-0.5 rounded-full font-bold text-on-surface">
                          {c.role || c.segment}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Talepler */}
                {searchResults.demands.length > 0 && (
                  <div className="border-t border-surface-container/60 pt-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">psychology</span>
                      <span>Müşteri Talepleri ({searchResults.demands.length})</span>
                    </div>
                    {searchResults.demands.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleSelectResult('/talepler')}
                        className="w-full text-left p-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-sm text-xs font-semibold text-primary truncate group-hover:text-secondary">
                            {d.clientName} ({d.propertyType})
                          </span>
                          <span className="font-caption text-[11px] text-on-surface-variant truncate">
                            {d.id} • Aranan: {d.targetRegion || d.district}
                          </span>
                        </div>
                        <span className="font-label-sm text-[11px] font-bold text-secondary shrink-0">
                          {d.budget}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 4. Anlaşmalar */}
                {searchResults.deals.length > 0 && (
                  <div className="border-t border-surface-container/60 pt-1">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">handshake</span>
                      <span>Satış &amp; Kiralama Fırsatları ({searchResults.deals.length})</span>
                    </div>
                    {searchResults.deals.map((deal) => (
                      <button
                        key={deal.id}
                        type="button"
                        onClick={() => handleSelectResult('/satis-ve-kiralama')}
                        className="w-full text-left p-2 rounded-lg hover:bg-surface-container-low transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-sm text-xs font-semibold text-primary truncate group-hover:text-secondary">
                            {deal.title}
                          </span>
                          <span className="font-caption text-[11px] text-on-surface-variant truncate">
                            {deal.customerName} • {deal.propertyTitle}
                          </span>
                        </div>
                        <span className="font-caption text-[10px] bg-secondary-fixed/50 text-secondary px-2 py-0.5 rounded font-bold">
                          {deal.stageTitle || 'Fırsat'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <span className="hidden xl:inline-flex items-center gap-space-xs bg-surface-container text-secondary font-label-sm text-label-sm px-space-sm py-1 rounded-full whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
          Aktif Ofis Modu
        </span>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-1 sm:gap-space-md shrink-0">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          type="button"
          aria-label="Bildirimler"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* Calendar */}
        <button
          className="hidden sm:inline-flex p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          type="button"
          aria-label="Takvim"
          onClick={() => navigate('/gorevler-ve-randevular')}
        >
          <span className="material-symbols-outlined text-[22px]">calendar_today</span>
        </button>

        {/* User Profile Dropdown */}
        <div ref={profileMenuRef} className="relative">
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-space-sm pl-space-xs sm:pl-space-sm cursor-pointer group border-l border-surface-container-low"
            aria-label="Kullanıcı Menüsü"
          >
            {currentUser?.avatarUrl ? (
              <img
                alt={currentUser.name || 'Kullanıcı'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-variant/50"
                src={currentUser.avatarUrl}
                width="32"
                height="32"
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-surface-container-high text-primary flex items-center justify-center font-bold text-xs ring-2 ring-surface-variant/50">
                {currentUser?.name ? (
                  currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                ) : (
                  <span className="material-symbols-outlined text-[18px]">person</span>
                )}
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface font-semibold leading-tight flex items-center gap-1">
                {currentUser?.name || (isAdmin ? 'Sistem Yöneticisi' : 'Danışman')}
              </span>
              <span className="font-caption text-caption text-on-surface-variant leading-tight flex items-center gap-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-primary' : 'bg-secondary'}`} />
                {currentUser?.displayRole || (isAdmin ? 'Yönetici' : 'Danışman')}
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface text-[18px] transition-colors">
              {isProfileMenuOpen ? 'expand_less' : 'expand_more'}
            </span>
          </div>

          {/* Profile Dropdown Popover */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 px-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-2">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {currentUser?.name || 'Kullanıcı'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {currentUser?.email || 'kullanici@emlakpro.com'}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                  <span className="material-symbols-outlined text-[13px]">
                    {isAdmin ? 'shield_person' : 'person'}
                  </span>
                  {currentUser?.displayRole || (isAdmin ? 'Yönetici' : 'Danışman')}
                </div>
              </div>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/ayarlar');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-slate-500">settings</span>
                  Ofis ve Sistem Ayarları
                </button>
              )}

              {/* View Public Portal */}
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  navigate('/ilanlar');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-slate-500">public</span>
                Müşteri Portalı Vitrini
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors text-left mt-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-rose-600">logout</span>
                Oturumu Kapat (Çıkış Yap)
              </button>
            </div>
          )}
        </div>

        {/* Public Portal Quick Link */}
        <button
          type="button"
          onClick={() => navigate('/ilanlar')}
          title="Müşteri Portalı Vitrini"
          aria-label="Müşteri Portalı Vitrini"
          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">public</span>
        </button>

        {/* Quick Direct Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Çıkış Yap"
          aria-label="Çıkış Yap"
          className="p-2 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}
