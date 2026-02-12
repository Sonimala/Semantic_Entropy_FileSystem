
export interface FileNode {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'pdf' | 'doc';
  category: string;
  keywords: string[];
  size: number;
  lastModified: number;
  x?: number;
  y?: number;
}

export interface SemanticCluster {
  name: string;
  files: string[]; // IDs of files
  color: string;
}

export enum OSActionType {
  CREATE = 'CREATE',
  MODIFY = 'MODIFY',
  RENAME = 'RENAME',
  DELETE = 'DELETE'
}

export interface OSLog {
  timestamp: number;
  action: OSActionType;
  fileName: string;
  details: string;
}
