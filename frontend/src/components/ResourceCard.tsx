import { Resource } from '../types';
interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

const getProviderImage = (provider: string): string => {
  if (provider === 'hashicorp/aws') {
    return '/images/aws.png';
  }
  if (provider.includes('hashicorp/azure') || provider.includes('hashicorp/vault'))  {
    return '/images/azure.png';
  }
  if (provider === 'terraform.io/builtin/terraform' || provider === 'hashicorp/tfe') {
    return '/images/terraform.png';
  }
  return '/images/generic.png';
};

export function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const providerImage = getProviderImage(resource.attributes.provider);
  const resourceName = resource.attributes.name || '';
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
