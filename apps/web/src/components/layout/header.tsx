'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const navItemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user, accessToken, logout } = useAuthStore();
  const pathname = usePathname();

  const { categories, isLoading } = useNavCategories(activeDropdownSection);

  const activeSection = activeDropdownSection
    ? NAV_SECTIONS.find((s) => s.key === activeDropdownSection)
    : null;

  // Check if a nav section is the current page
  const isSectionActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

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

  // Focus trap for mobile menu
  useEffect(() => {
    if (!mobileMenuOpen || !mobileMenuRef.current) return;

    const menuElement = mobileMenuRef.current;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMenuTriggerRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusableElements = menuElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    menuElement.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable element when menu opens
    const focusableElements = menuElement.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return () => menuElement.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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

  // Keyboard navigation for mega dropdown nav items
  const handleNavKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = index < NAV_SECTIONS.length - 1 ? index + 1 : 0;
      navItemsRef.current[nextIndex]?.focus();
      setActiveDropdownSection(NAV_SECTIONS[nextIndex].key);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = index > 0 ? index - 1 : NAV_SECTIONS.length - 1;
      navItemsRef.current[prevIndex]?.focus();
      setActiveDropdownSection(NAV_SECTIONS[prevIndex].key);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveDropdownSection(NAV_SECTIONS[index].key);
    } else if (e.key === 'Escape') {
      setActiveDropdownSection(null);
    }
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4" ref={navRef}>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-heading font-bold text-primary-600" aria-label="ILOVEBERLIN home">
            I<span className="text-red-500" aria-hidden="true">&#9829;</span>Berlin
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-6" aria-label="Main navigation">
            {NAV_SECTIONS.map((section, index) => (
              <div
                key={section.key}
                className="relative"
                onMouseEnter={() => handleNavItemEnter(section.key)}
                onMouseLeave={handleNavItemLeave}
              >
                <Link
                  ref={(el) => { navItemsRef.current[index] = el; }}
                  href={section.href}
                  className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                    activeDropdownSection === section.key
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                  aria-expanded={activeDropdownSection === section.key}
                  aria-haspopup="true"
                  aria-current={isSectionActive(section.href) ? 'page' : undefined}
                  onKeyDown={(e) => handleNavKeyDown(e, index)}
                >
                  {section.label}
                  <svg
                    className={`w-3 h-3 transition-transform duration-200 ${
                      activeDropdownSection === section.key ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
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
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label={`User menu for ${user.display_name}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold overflow-hidden">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.display_name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user.display_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span>{user.display_name}</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg border border-white/30 rounded-xl shadow-xl py-1 z-50" role="menu" aria-label="User menu">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                      role="menuitem"
                    >
                      My Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
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
            ref={mobileMenuTriggerRef}
            type="button"
            className="lg:hidden p-2 text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
          <nav
            ref={mobileMenuRef}
            id="mobile-menu"
            className="lg:hidden py-4 border-t border-gray-100"
            aria-label="Mobile navigation"
          >
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

    </header>
  );
}
