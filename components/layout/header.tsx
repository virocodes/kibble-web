'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAppStore } from '@/stores/app-store'
import { useState } from 'react'

export function Header() {
  const { githubUser, logout } = useAppStore()
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-kibble-surface border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/projects" className="flex items-center gap-2">
            <span className="text-xl font-bold text-kibble-primary">Kibble</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/projects"
              className="text-sm font-medium text-kibble-text-secondary hover:text-kibble-text-primary transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/sessions"
              className="text-sm font-medium text-kibble-text-secondary hover:text-kibble-text-primary transition-colors"
            >
              Sessions
            </Link>
          </nav>

          {/* User Menu */}
          {githubUser && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Image
                  src={githubUser.avatar_url}
                  alt={githubUser.login}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
                <span className="hidden sm:block text-sm font-medium text-kibble-text-primary">
                  {githubUser.login}
                </span>
                <svg
                  className="w-4 h-4 text-kibble-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-kibble-surface rounded-lg shadow-lg border border-gray-200 py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-kibble-text-primary">
                        {githubUser.name || githubUser.login}
                      </p>
                      <p className="text-xs text-kibble-text-secondary">
                        @{githubUser.login}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-kibble-error hover:bg-gray-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
