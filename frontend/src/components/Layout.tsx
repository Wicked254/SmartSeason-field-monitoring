import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/auth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 flex flex-col gap-3 md:h-16 md:py-0 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:space-x-8 md:gap-0">
              <h1 className="text-lg md:text-xl font-semibold text-gray-900">
                SmartSeason Field Monitoring
              </h1>
              <nav className="flex flex-wrap gap-2 md:space-x-4 md:gap-0">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === '/'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/fields"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname.startsWith('/fields')
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  Fields
                </Link>
              </nav>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:space-x-4 md:gap-0">
              <span className="text-sm text-gray-700 break-all">
                Welcome, {user?.username}
                {user?.is_staff && ' (Admin)'}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
