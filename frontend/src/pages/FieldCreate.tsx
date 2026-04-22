import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FieldStage, User, PaginatedResponse } from '../types';
import { fieldAPI, userAPI } from '../services/api';

const FieldCreate: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [cropType, setCropType] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [currentStage, setCurrentStage] = useState<FieldStage>(FieldStage.PLANTED);
  const [assignedAgentId, setAssignedAgentId] = useState<number | ''>('');

  const [agents, setAgents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const data = await userAPI.getUsers();
      const users = Array.isArray(data) ? data : (data as PaginatedResponse<User>).results;
      setAgents(users.filter((u) => !u.is_staff));
    } catch (e) {
      setAgents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const payload: any = {
        name,
        crop_type: cropType,
        planting_date: plantingDate,
        current_stage: currentStage,
      };

      if (assignedAgentId !== '') {
        payload.assigned_agent_id = assignedAgentId;
      }

      const created = await fieldAPI.createField(payload);
      navigate(`/fields/${created.id}`);
    } catch (err: any) {
      const msg = err?.response?.data ? JSON.stringify(err.response.data) : 'Failed to create field';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Field</h2>
        <p className="text-gray-600">Add a new field and optionally assign it to a field agent.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-xl bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Crop type</label>
          <input
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Planting date</label>
          <input
            type="date"
            value={plantingDate}
            onChange={(e) => setPlantingDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current stage</label>
          <select
            value={currentStage}
            onChange={(e) => setCurrentStage(e.target.value as FieldStage)}
            className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
          >
            {Object.values(FieldStage).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Assign agent (optional)</label>
          <select
            value={assignedAgentId}
            onChange={(e) => setAssignedAgentId(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-400 bg-white shadow-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">Unassigned</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.username}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/fields')}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FieldCreate;
