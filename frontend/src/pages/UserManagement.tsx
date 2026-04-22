import React, { useEffect, useState } from 'react';
import { User, PaginatedResponse } from '../types';
import { userAPI } from '../services/api';
import api from '../services/api';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setError('');
    setIsLoading(true);
    try {
      const data = await userAPI.getUsers();
      const list = Array.isArray(data) ? data : (data as PaginatedResponse<User>).results;
      setUsers(list);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    try {
      await api.post('/users/', {
        username,
        email,
        password,
        is_staff: isStaff,
      });
      setUsername('');
      setEmail('');
      setPassword('');
      setIsStaff(false);
      await loadUsers();
    } catch (err: any) {
      const msg = err?.response?.data ? JSON.stringify(err.response.data) : 'Failed to create user';
      setError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
        <p className="text-gray-600">Admins can create users and view all users.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create User</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="is_staff"
                type="checkbox"
                checked={isStaff}
                onChange={(e) => setIsStaff(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_staff" className="text-sm text-gray-700">
                Admin user
              </label>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isCreating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Users</h3>
            <button
              onClick={loadUsers}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Refresh
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{u.username}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{u.is_staff ? 'Admin' : 'Agent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
