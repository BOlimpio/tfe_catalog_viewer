import React, { useState, useEffect } from 'react';
import { Workspace, Resource } from './types';
import { Dropdown } from './components/Dropdown';
import { MultiSelect } from './components/MultiSelect';
import { ResourceCard } from './components/ResourceCard';
import { ResourceModal } from './components/ResourceModal';
import { Layout } from 'lucide-react';
import { Dialog, DialogTitle, DialogPanel } from '@headlessui/react';

const FILTER_KEYS = ['name', 'provider-type', 'created-at', 'updated-at', 'module', 'provider'];
const API_BASE = 'http://localhost:8000/api/v2';
const AUTH_HEADER = { headers: { Authorization: 'Bearer mock-token' } };

type FilterState = Record<string, string[]>;

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedModalResource, setSelectedModalResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(true);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/organizations/example-org/workspaces`, AUTH_HEADER);
        const data = await response.json();
        setWorkspaces(data.data);
      } catch (error) {
        console.error('Failed to fetch workspaces:', error);
      }
      setLoading(false);
    };

    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      if (!selectedWorkspace) {
        setResources([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/workspaces/${selectedWorkspace}/resources`, AUTH_HEADER);
        const data = await response.json();
        setResources(data.data);
        setFilters({});
      } catch (error) {
        console.error('Failed to fetch resources:', error);
      }
      setLoading(false);
    };

    fetchResources();
  }, [selectedWorkspace]);

  const groupedFilterOptions = React.useMemo(() => {
    const grouped: Record<string, Set<string>> = {};
    FILTER_KEYS.forEach(key => (grouped[key] = new Set()));

    resources.forEach(resource => {
      FILTER_KEYS.forEach(key => {
        const value = (resource.attributes as Record<string, any>)[key];
        if (value !== undefined && value !== null) {
          grouped[key].add(String(value));
        }
      });
    });

    const result: Record<string, { value: string; label: string }[]> = {};
    Object.entries(grouped).forEach(([key, values]) => {
      result[key] = Array.from(values).map(value => ({ value, label: value }));
    });

    return result;
  }, [resources]);

  const filteredResources = React.useMemo(() => {
    return resources.filter(resource => {
      return Object.entries(filters).every(([key, values]) => {
        const attrValue = String((resource.attributes as Record<string, any>)[key]);
        return values.length === 0 || values.includes(attrValue);
      });
    });
  }, [resources, filters]);

  return (
    <div className={`min-h-screen ${showWorkspaceModal ? 'opacity-30 pointer-events-none select-none' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <Layout className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            TFE Catalog Viewer
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Dropdown
            label="Workspace"
            value={selectedWorkspace}
            options={workspaces.map(ws => ({ value: ws.id, label: ws.attributes.name }))}
            onChange={(value) => {
              setSelectedWorkspace(value);
              setShowWorkspaceModal(false);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
              <button
                className="text-xs border border-green-600 text-green-600 px-2 py-1 rounded hover:bg-green-50"
                onClick={() => setFilters({})}
              >
                Clear Filters
              </button>
            </div>
            <div className="space-y-4">
              {FILTER_KEYS.map(key => (
                <div key={key}>
                  <p className="text-xs font-medium text-gray-600 mb-1 capitalize">
                    {key === 'provider-type' ? 'Resource type' : key.replace(/-/g, ' ')}
                  </p>
                  <MultiSelect
                    label=""
                    values={filters[key] || []}
                    options={groupedFilterOptions[key] || []}
                    onChange={selected => {
                      setFilters(prev => {
                        const updated = { ...prev };
                        updated[key] = selected;
                        return updated;
                      });
                    }}
                    disabled={!selectedWorkspace}
                  />
                </div>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="text-center py-12 col-span-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : (
                filteredResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onClick={() => setSelectedModalResource(resource)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {selectedModalResource && (
          <ResourceModal
            resource={selectedModalResource}
            onClose={() => setSelectedModalResource(null)}
          />
        )}

        <Dialog open={showWorkspaceModal && workspaces.length > 0 && !selectedWorkspace} onClose={() => {}} className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <DialogPanel className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <DialogTitle className="text-lg font-medium text-gray-900 mb-4">Select a TFE workspace to begin</DialogTitle>
              <Dropdown
                label="Workspace"
                value={selectedWorkspace}
                options={workspaces.map(ws => ({ value: ws.id, label: ws.attributes.name }))}
                onChange={(value) => {
                  setSelectedWorkspace(value);
                  setShowWorkspaceModal(false);
                }}
              />
            </DialogPanel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
