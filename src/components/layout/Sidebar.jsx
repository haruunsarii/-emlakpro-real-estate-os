import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { navigationItems } from '../../services/mockData';
import { initialOfficeProfile } from '../../services/settingsData';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ isOpen, onClose }) {
  useModalBehavior(isOpen, onClose);
  const { currentUser } = useAuth();
  const userRole = currentUser?.role || 'consultant';

  const visibleNavigationItems = useMemo(() => {
    return navigationItems
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          if (!item.roles || item.roles.length === 0) return true;
          return item.roles.includes(userRole);
        });
        return {
          ...group,
          items: filteredItems,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [userRole]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-primary/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer / Fixed Panel */}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-surface-container-low select-none transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="h-16 px-space-md flex items-center justify-between border-b border-surface-container-low">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
                <span className="material-symbols-outlined text-[20px]">apartment</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">
                EmlakPro
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-caption text-caption bg-surface-container text-on-surface px-space-sm py-space-xs rounded-full font-medium">
                v2.4 Pro
              </span>
              {/* Close Button on Mobile */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Menüyü Kapat"
                title="Menüyü Kapat"
                className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface cursor-pointer rounded-lg hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="flex-1 px-space-sm py-space-sm flex flex-col gap-space-xs">
            {visibleNavigationItems.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col">
                <div className="px-space-sm pt-space-md pb-space-xs font-caption text-caption uppercase text-on-surface-variant tracking-wider font-semibold text-[11px]">
                  {group.section}
                </div>
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center gap-space-sm px-space-sm py-2 rounded-lg transition-colors font-label-md text-label-md ${
                        isActive
                          ? 'bg-primary-container text-on-secondary-container font-semibold shadow-xs'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Office Switcher Footer */}
        <div className="p-space-sm bg-surface-container-low border-t border-surface-container">
          <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container transition-colors cursor-pointer shadow-xs">
            <div className="flex flex-col overflow-hidden pr-space-xs">
              <span className="font-caption text-caption text-on-surface-variant truncate">
                {initialOfficeProfile.branch}
              </span>
              <span className="font-label-sm text-label-sm text-primary font-semibold truncate">
                EmlakPro Prime
              </span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              swap_horiz
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
