import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardData, FieldStatus } from '../types';
import { dashboardAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await dashboardAPI.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'No data available'}
      </div>
    );
  }

  const getStatusColor = (status: FieldStatus) => {
    switch (status) {
      case FieldStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case FieldStatus.AT_RISK:
        return 'bg-red-100 text-red-800';
      case FieldStatus.COMPLETED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {dashboardData.is_admin ? 'Admin Dashboard' : 'Agent Dashboard'}
            </h2>
            <p className="text-gray-600">
              {dashboardData.is_admin 
                ? 'Overview of all fields and agent activity' 
                : 'Overview of your assigned fields'
              }
            </p>
          </div>
          
          {dashboardData.is_admin && (
            <div className="flex space-x-4">
              <Link
                to="/fields/new"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create New Field
              </Link>
              <Link
                to="/users"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Manage Users
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                  <span className="text-white font-semibold">F</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Fields</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.total_fields}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${getStatusColor(FieldStatus.ACTIVE)}`}>
                  <span className="font-semibold">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.status_counts[FieldStatus.ACTIVE]}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${getStatusColor(FieldStatus.AT_RISK)}`}>
                  <span className="font-semibold">!</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">At Risk</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.status_counts[FieldStatus.AT_RISK]}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${getStatusColor(FieldStatus.COMPLETED)}`}>
                  <span className="font-semibold">C</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                  <dd className="text-lg font-medium text-gray-900">{dashboardData.status_counts[FieldStatus.COMPLETED]}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Fields */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Fields</h3>
            <div className="space-y-4">
              {dashboardData.recent_fields.map((field) => (
                <div key={field.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{field.name}</p>
                    <p className="text-sm text-gray-500">{field.crop_type} - {field.current_stage}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(field.status)}`}>
                    {field.status_label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Updates</h3>
            <div className="space-y-4">
              {dashboardData.recent_updates.map((update) => (
                <div key={update.id} className="border-l-4 border-indigo-500 pl-4">
                  <p className="text-sm font-medium text-gray-900">
                    {(update.field?.name ?? 'Unknown field')} - {update.stage}
                  </p>
                  <p className="text-sm text-gray-500">{update.note}</p>
                  <p className="text-xs text-gray-400">
                    by {update.agent.username} on {new Date(update.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
