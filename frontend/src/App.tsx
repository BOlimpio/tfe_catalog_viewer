import React, { useState, useEffect, useCallback } from 'react';
import { Workspace, Resource } from './types';
import { MultiSelect } from './components/MultiSelect';
import { ResourceCard } from './components/ResourceCard';
import { ResourceModal } from './components/ResourceModal';
import { Layout } from 'lucide-react';
import { Combobox } from '@headlessui/react';
import debounce from 'lodash.debounce';

const FILTER_KEYS = ['name', 'provider-type', 'created-at', 'updated-at', 'module', 'provider'];
const API_BASE = 'http://localhost:8000/proxy';
const AUTH_HEADER = { headers: { Authorization: 'Bearer {TFE_API_TOKEN}' } };
const TFE_ORGANIZATION = '{TFE_ORGANIZATION}'
const PAGE_SIZE = 30;

type FilterState = Record<string, string[]>;

function App() {
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedModalResource, setSelectedModalResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWorkspaceSearch = useCallback(
    debounce(async (search: string) => {
      const res = await fetch(`${API_BASE}/organizations/${TFE_ORGANIZATION}/workspaces?page[number]=1&page[size]=100&search[name]=${encodeURIComponent(search)}`, AUTH_HEADER);
      const json = await res.json();
      setFilteredWorkspaces(json.data);
    }, 400),
    []
  );

  useEffect(() => {
    fetchWorkspaceSearch(workspaceSearch);
  }, [workspaceSearch, fetchWorkspaceSearch]);

  const fetchResources = async (workspaceId: string, page = 1) => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/resources?page[number]=${page}&page[size]=${PAGE_SIZE}`, AUTH_HEADER);
      const data = await response.json();
      setResources(data.data);
      setPagination({
        page,
        totalPages: data.meta.pagination['total-pages'] || 1
      });
      setFilters({});
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedWorkspace) {
      fetchResources(selectedWorkspace, 1);
    }
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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchResources(selectedWorkspace, newPage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <Layout className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-900">TFE Catalog Viewer</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="col-span-1 md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Workspace:</label>
            <Combobox value={selectedWorkspace} onChange={(value: string) => setSelectedWorkspace(value)}>
              <div className="relative">
                <Combobox.Input
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Search workspace..."
                  onChange={(e) => setWorkspaceSearch(e.target.value)}
                  displayValue={(val: string) => {
                    const ws = filteredWorkspaces.find(w => w.id === val);
                    return ws ? ws.attributes.name : '';
                  }}
                />
                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
                  {filteredWorkspaces.map(ws => (
                    <Combobox.Option
                      key={ws.id}
                      value={ws.id}
                      className={({ active }) => `px-4 py-2 cursor-pointer ${active ? 'bg-green-100 text-green-900' : 'text-gray-900'}`}
                    >
                      {ws.attributes.name}
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </Combobox>
          </div>
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

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 rounded border text-sm ${p === pagination.page ? 'bg-green-600 text-white' : ''}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedModalResource && (
          <ResourceModal
            resource={selectedModalResource}
            onClose={() => setSelectedModalResource(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;