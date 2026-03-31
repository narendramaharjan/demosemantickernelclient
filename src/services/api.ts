import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://localhost:7297/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    toast.error(message);
    return Promise.reject(error);
  }
);

export interface ConnectionRequest {
  connectionString: string;
}

export interface DatabaseTable {
  tableName: string;
  schema: string;
  columns: TableColumn[];
}

export interface TableColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface QueryRequest {
  naturalLanguageQuery: string;
  selectedTables: string[];
  connectionString?: string;
}

export interface QueryResult {
  generatedSql: string;
  data: any;
  rows: Record<string, any>[];
  columns: string[];
  error?: string;
  success: boolean;
  executionTime: number;
  rowCount: number;
}

const databaseApi = {
  connect: (connectionString: string) =>
    api.post('/database/connect', { connectionString }),

  getTables: (connectionString?: string) =>
    api.get<DatabaseTable[]>('/database/tables', {
      params: { connectionString },
    }),

  getTableNames: (connectionString?: string) =>
    api.get<string[]>('/database/table-names', {
      params: { connectionString },
    }),

  testConnection: (connectionString: string) =>
    api.get<{ isValid: boolean }>('/database/test-connection', {
      params: { connectionString },
    }),
};

const queryApi = {
  executeNaturalLanguage: (request: QueryRequest) =>
    api.post<QueryResult>('/query/natural-language', request),

  executeSql: (sqlQuery: string, connectionString?: string) =>
    api.post<QueryResult>('/query/execute-sql', {
      sqlQuery,
      connectionString,
    }),
};

export { databaseApi, queryApi };
export default api;