'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { SearchBar } from '@/components/search/search-bar';
import { NAV_SECTIONS } from '@/lib/nav-config';
import { useNavCategories } from '@/hooks/use-nav-categories';
import { MegaDropdownPanel } from './mega-dropdown-panel';
import { MobileNavAccordion } from './mobile-nav-accordion';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeDropdownSection, setActiveDropdownSection] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, accessToken, logout } = useAuthStore();
  const pathname = usePathname();

  const { categories, isLoading } = useNavCategories(activeDropdownSection);

  const activeSection = activeDropdownSection
    ? NAV_SECTIONS.find((s) => s.key === activeDropdownSection)
    : null;

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdownSection(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Click outside to close user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        activeDropdownSection &&
        navRef.current &&
        !navRef.current.contains(event.target as Node)
      ) {
        setActiveDropdownSection(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownSection]);

  // Escape key to close dropdown
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveDropdownSection(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    };
  }, []);

  const handleNavItemEnter = useCallback((sectionKey: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }

    enterTimeoutRef.current = setTimeout(() => {
      setActiveDropdownSection(sectionKey);
    }, activeDropdownSection ? 100 : 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDropdownSection]);

  const handleNavItemLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveDropdownSection(null);
    }, 300);
  }, []);

  const handlePanelEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  const handlePanelLeave = useCallback(() => {
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveDropdownSection(null);
    }, 300);
  }, []);

  const closeDropdown = useCallback(() => {
    setActiveDropdownSection(null);
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4" ref={navRef}>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-heading font-bold text-primary-600">
            ILoveBerlin
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-6" aria-label="Main navigation">
            {NAV_SECTIONS.map((section) => (
              <div
                key={section.key}
                className="relative"
                onMouseEnter={() => handleNavItemEnter(section.key)}
                onMouseLeave={handleNavItemLeave}
              >
                <Link
                  href={section.href}
                  className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                    activeDropdownSection === section.key
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {section.label}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${
                      activeDropdownSection === section.key ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>
              </div>
            ))}
          </nav>

          {/* Search + Desktop Auth */}
          <div className="hidden lg:flex items-center space-x-3">
            <SearchBar />
            {accessToken && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold overflow-hidden">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{user.display_name}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl shadow-xl py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mega Dropdown Panel (Desktop) */}
        {activeSection && (
          <MegaDropdownPanel
            section={activeSection}
            categories={categories}
            isLoading={isLoading}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
            onNavigate={closeDropdown}
          />
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-100" aria-label="Mobile navigation">
            <MobileNavAccordion onNavigate={() => setMobileMenuOpen(false)} />
            <hr className="my-2 border-gray-100" />
            {accessToken && user ? (
              <>
                <Link
                  href="/profile"
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="block w-full text-left py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>

      {/* Dropdown animation styles */}
      <style jsx global>{`
        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-dropdown-in {
          animation: dropdown-in 150ms ease-out;
        }
      `}</style>
    </header>
  );
}
