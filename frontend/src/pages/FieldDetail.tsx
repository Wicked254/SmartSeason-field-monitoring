import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Field, FieldUpdate, FieldStage, FieldStatus } from '../types';
import { fieldAPI } from '../services/api';
import { useAuth } from '../utils/auth';

const FieldDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const fieldId = id ? Number(id) : NaN;
  const [field, setField] = useState<Field | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateForm, setUpdateForm] = useState({ stage: FieldStage.PLANTED, note: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!id) return;

    if (Number.isNaN(fieldId)) {
      setError('Invalid field id');
      setIsLoading(false);
      return;
    }

    loadField();
  }, [id, user]);

  const loadField = async () => {
    try {
      const data = await fieldAPI.getField(fieldId);
      setField(data);
      setUpdateForm({ stage: data.current_stage, note: '' });
    } catch (err: any) {
      setError('Failed to load field');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field || Number.isNaN(fieldId)) return;

    setIsSubmitting(true);
    try {
      await fieldAPI.addFieldUpdate(fieldId, updateForm);
      await loadField(); // Reload to get updated data
      setUpdateForm({ stage: field.current_stage, note: '' });
    } catch (err: any) {
      setError('Failed to submit update');
    } finally {
      setIsSubmitting(false);
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
        <div className="text-gray-600">Loading field details...</div>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error || 'Field not found'}
      </div>
    );
  }

  const canUpdateField = user?.is_staff || field.assigned_agent?.id === user?.id;

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <Link to="/fields" className="text-indigo-600 hover:text-indigo-800 text-sm">
          &larr; Back to Fields
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {field.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {field.crop_type}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(field.status)}`}>
              {field.status_label}
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Stage</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {field.current_stage}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Planting Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(field.planting_date).toLocaleDateString()}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Assigned Agent</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {field.assigned_agent?.username || 'Unassigned'}
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(field.updated_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Update Form */}
      {canUpdateField && (
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Submit Field Update
            </h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                  Stage
                </label>
                <select
                  id="stage"
                  value={updateForm.stage}
                  onChange={(e) => setUpdateForm({ ...updateForm, stage: e.target.value as FieldStage })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  {Object.values(FieldStage).map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                  Note/Observation
                </label>
                <textarea
                  id="note"
                  rows={3}
                  value={updateForm.note}
                  onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Updates History */}
      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Update History
          </h3>
          <div className="space-y-4">
            {field.updates.map((update: FieldUpdate) => (
              <div key={update.id} className="border-l-4 border-indigo-500 pl-4">
                <p className="text-sm font-medium text-gray-900">
                  {update.stage}
                </p>
                <p className="text-sm text-gray-500">{update.note}</p>
                <p className="text-xs text-gray-400">
                  by {update.agent.username} on {new Date(update.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {field.updates.length === 0 && (
              <p className="text-gray-500">No updates yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldDetail;
