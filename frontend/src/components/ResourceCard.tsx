import React from 'react';
import { Resource } from '../types';
import { Server, Database, HardDrive } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

const getProviderImage = (provider: string): string => {
  if (provider.includes('hashicorp/aws')) {
    return '/images/aws.png';
  }
  if (provider.includes('hashicorp/azurerm')) {
    return '/images/azure.png';
  }
  if (provider.includes('terraform.io/builtin/terraform')) {
    return '/images/terraform.png';
  }
  return '/images/generic.png';
};

const getResourceIcon = (type: string) => {
  if (type.includes('lambda')) return Server;
  if (type.includes('database') || type.includes('dynamodb')) return Database;
  return HardDrive;
};

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const Icon = getResourceIcon(resource.attributes['provider-type']);
  const providerImage = getProviderImage(resource.attributes.provider);
  const resourceName = resource.attributes.address.split('.').pop() || '';
  const baseProviderType = resource.attributes['provider-type'];

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 overflow-hidden"
    >
      <div className="h-32 w-full relative">
        <img
          src={providerImage}
          alt={`${resource.attributes.provider} provider`}
          className="w-full h-full object-contain p-4 bg-white"
        />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900 truncate">
            {resourceName}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {baseProviderType}
          </span>
          {Object.entries(resource.attributes).map(([key, value]) => (
            typeof value === 'string' &&
            !['address', 'provider-type', 'modified-by-state-version-id', 'name-index'].includes(key) && (
              <span
                key={key}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {value}
              </span>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
