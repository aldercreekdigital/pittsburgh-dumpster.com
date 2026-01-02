'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { NAV_LINKS, PHONE_NUMBERS } from '@/lib/constants';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setIsLoading(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <header className="bg-primary-dark-green text-white sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-green/50 py-2 px-4 hidden md:block">
        <div className="container-wide flex justify-between items-center text-sm">
          <span>Serving Western PA, WV & OH - Same-Day Delivery Available!</span>
          <a
            href={`tel:${PHONE_NUMBERS.tracked.website}`}
            className="font-bold hover:text-accent-orange transition"
          >
            Call Now: {PHONE_NUMBERS.display}
          </a>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="container-wide py-4 px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-horizontal.png"
              alt="McCrackan Roll-Off Services"
              width={200}
              height={50}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center space-x-1 py-2 hover:text-accent-orange transition">
                    <span>{link.label}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 bg-white text-gray-800 rounded-lg shadow-lg py-2 min-w-[180px]">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 hover:bg-primary-light/10 hover:text-primary-dark-green transition"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className="py-2 hover:text-accent-orange transition"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="p-2 hover:text-accent-orange transition relative"
              title="Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            {/* Auth Button */}
            {!isLoading && (
              isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition"
                >
                  Login
                </Link>
              )
            )}

            <Link href="/booking" className="btn-primary">
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-primary-green/30 pt-4">
            <div className="space-y-3">
              {NAV_LINKS.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <button
                      className="w-full text-left py-2 font-semibold flex justify-between items-center"
                      onClick={() => setOpenDropdown(openDropdown === link.label ? null : link.label)}
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 transition-transform ${openDropdown === link.label ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === link.label && (
                      <div className="pl-4 space-y-2 mt-2">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block py-1 text-gray-300 hover:text-white"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href!}
                    className="block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
              <div className="pt-4 space-y-3">
                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-2 py-3 border border-white/30 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Cart
                </Link>

                {!isLoading && (
                  isLoggedIn ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-center py-3 border border-white/30 rounded-lg"
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="block text-center py-3 border border-white/30 rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )
                )}

                <a
                  href={`tel:${PHONE_NUMBERS.tracked.website}`}
                  className="block text-center py-3 bg-primary-green rounded-lg font-bold"
                >
                  Call: {PHONE_NUMBERS.display}
                </a>
                <Link
                  href="/booking"
                  className="btn-primary w-full text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
