import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function PortalHeader() {
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Ana Sayfa', path: '/' },
    { label: 'Satılık', path: '/ilanlar?tip=Satılık' },
    { label: 'Kiralık', path: '/ilanlar?tip=Kiralık' },
    { label: 'Talep Bırak', path: '/talep-birak' },
    { label: 'İletişim', path: '/iletisim' },
  ];

  const isLinkActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path.split('?')[0]);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="EmlakPro Müşteri Portalı Ana Sayfa"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[24px] text-secondary-fixed-dim">
              apartment
            </span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-primary tracking-tight leading-none">
              Emlak<span className="text-secondary">Pro</span>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
              Gayrimenkul Portalı
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'text-primary bg-slate-100 font-bold'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Listings Link */}
          <Link
            to="/ilanlar"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-slate-500">search</span>
            <span>İlanları İncele</span>
          </Link>

          {/* Conditional Admin/Agent Login vs Dashboard Button */}
          {isAuthenticated && currentUser ? (
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-slate-800 transition-all shadow-xs"
              title="Yönetim Paneline (CRM) Geçiş Yap"
            >
              <span className="material-symbols-outlined text-[18px] text-emerald-400">
                dashboard
              </span>
              <span>CRM Paneli</span>
              <span className="text-[11px] opacity-75 font-normal">
                ({currentUser.displayRole || 'Yetkili'})
              </span>
            </Link>
          ) : (
            <Link
              to="/giris"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-primary border border-slate-300 hover:border-primary hover:bg-primary/5 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>Danışman Girişi</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {isAuthenticated && currentUser && (
            <Link
              to="/"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-white flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">dashboard</span>
              <span>CRM</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-700 hover:text-primary hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label={mobileMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
            title={mobileMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-white border-b border-slate-200 shadow-xl p-5 space-y-3 animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-base font-semibold transition-all ${
                      active
                        ? 'text-primary bg-slate-100 font-bold'
                        : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <Link
                to="/ilanlar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                <span>Tüm İlanları Gör</span>
              </Link>

              {isAuthenticated && currentUser ? (
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  <span>CRM Yönetim Paneline Dön</span>
                </Link>
              ) : (
                <Link
                  to="/giris"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold border border-slate-300 text-primary hover:bg-slate-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">lock</span>
                  <span>Danışman & Personel Girişi</span>
                </Link>
              )}
            </div>
          </div>

          {/* Dismiss backdrop */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
