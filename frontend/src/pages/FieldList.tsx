import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Field, FieldStatus, PaginatedResponse } from '../types';
import { fieldAPI } from '../services/api';
import { useAuth } from '../utils/auth';

const FieldList: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    try {
      const data = await fieldAPI.getFields();
      const list = Array.isArray(data) ? data : (data as PaginatedResponse<Field>).results;
      setFields(list);
    } catch (err: any) {
      setError('Failed to load fields');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading fields...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fields</h2>
          <p className="text-gray-600">
            {user?.is_staff ? 'All fields in the system' : 'Fields assigned to you'}
          </p>
        </div>
        {user?.is_staff && (
          <Link
            to="/fields/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Create Field
          </Link>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {fields.map((field) => (
            <li key={field.id}>
              <Link to={`/fields/${field.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {field.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {field.crop_type} - {field.current_stage}
                      </p>
                      <p className="text-sm text-gray-500">
                        Assigned to: {field.assigned_agent?.username || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:space-x-3 sm:gap-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(field.status)}`}>
                        {field.status_label}
                      </span>
                      <div className="text-sm text-gray-500">
                        Planted: {new Date(field.planting_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {fields.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No fields found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldList;
