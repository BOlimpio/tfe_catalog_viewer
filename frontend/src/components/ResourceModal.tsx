import React from 'react';
import { X } from 'lucide-react';
import { Resource } from '../types';

interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

export function ResourceModal({ resource, onClose }: ResourceModalProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900">Resource Details</h2>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900">Type</h3>
            <p className="mt-1 text-gray-600">{resource.type}</p>

            <h3 className="text-lg font-medium text-gray-900 mt-4">ID</h3>
            <p className="mt-1 text-gray-600">{resource.id}</p>

            <h3 className="text-lg font-medium text-gray-900 mt-4">Attributes</h3>
            <div className="mt-2 bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                {JSON.stringify(resource.attributes, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
