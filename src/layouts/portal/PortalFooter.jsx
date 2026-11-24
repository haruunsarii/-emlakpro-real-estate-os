import React from 'react';
import { Link } from 'react-router-dom';

export default function PortalFooter() {
  return (
    <footer className="bg-primary text-slate-300 pt-16 pb-10 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <span className="material-symbols-outlined text-[24px] text-secondary-fixed-dim">
                  apartment
                </span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-white tracking-tight leading-none">
                  Emlak<span className="text-secondary-fixed-dim">Pro</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                  Real Estate OS
                </div>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              İstanbul ve çevresinde lüks konut, villa, ticari gayrimenkul ve yatırım portföyü
              danışmanlığında profesyonel, şeffaf ve kurumsal emlak çözümleri.
            </p>
            {/* Social Links (Placeholders) */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                in
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                ig
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                yt
              </a>
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
              >
                fb
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Hızlı Erişim
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/ilanlar?tip=Satılık" className="hover:text-white transition-colors">
                  Satılık Gayrimenkuller
                </Link>
              </li>
              <li>
                <Link to="/ilanlar?tip=Kiralık" className="hover:text-white transition-colors">
                  Kiralık Gayrimenkuller
                </Link>
              </li>
              <li>
                <Link to="/talep-birak" className="hover:text-white transition-colors">
                  Aradığınız Gayrimenkulü Bulalım
                </Link>
              </li>
              <li>
                <Link to="/iletisim" className="hover:text-white transition-colors">
                  İletişim & Lokasyon
                </Link>
              </li>
              <li>
                <Link to="/giris" className="text-secondary-fixed-dim hover:text-white transition-colors font-semibold">
                  Danışman / Yetkili Girişi
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Office & Working Hours */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Çalışma Saatleri
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Pazartesi - Cuma:</span>
                <span className="text-white font-medium">09:00 - 19:00</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span>Cumartesi:</span>
                <span className="text-white font-medium">10:00 - 17:00</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pazar:</span>
                <span className="text-emerald-400 font-medium">Özel Randevulu</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
              Özel mülk sunumları ve portföy ekspertizleri için mesai saatleri dışında randevu alınabilir.
            </p>
          </div>

          {/* Col 4: Contact & Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Kurumsal İletişim
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 mt-0.5">
                  location_on
                </span>
                <span>Bağdat Caddesi No: 248, Kadıköy / İstanbul (Kurumsal Ofis)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0">
                  call
                </span>
                <span>0 (216) 444 00 00</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0">
                  mail
                </span>
                <span>iletisim@emlakpro.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 EmlakPro Real Estate OS. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">•</span>
            <span>Profesyonel Müşteri İlan Portalı</span>
            <span className="text-slate-600">•</span>
            <Link to="/giris" className="hover:text-slate-400 transition-colors">
              Personel Giriş Kapısı
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

