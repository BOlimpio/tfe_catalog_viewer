// src/types.ts

// Type definitions for the Terraform Enterprise API responses

export interface Workspace {
  id: string;
  type: string;
  attributes: {
    name: string;
    description: string | null;
    'execution-mode': string;
    'terraform-version': string;
    'resource-count': number;
    'created-at': string;
    'updated-at': string;
    locked: boolean;
    environment: string;
  };
}

export interface Resource {
  id: string;
  type: string;
  attributes: {
    address: string;
    name: string;
    'created-at': string;
    'updated-at': string;
    module: string;
    provider: string;
    'provider-type': string;
    'modified-by-state-version-id': string;
    'name-index': string | null;
  };
}

export interface ApiResponse<T> {
  data: T[];
  links: {
    self: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
  meta?: {
    pagination?: {
      'current-page': number;
      'next-page': number | null;
      'page-size': number;
      'prev-page': number | null;
      'total-count': number;
      'total-pages': number;
    };
  };
}
