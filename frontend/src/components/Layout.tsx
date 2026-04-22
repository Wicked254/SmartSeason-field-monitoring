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
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">
                SmartSeason Field Monitoring
              </h1>
              <nav className="flex space-x-4">
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
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
