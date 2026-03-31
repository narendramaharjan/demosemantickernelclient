import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Tab,
  Tabs,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ContentCopy,
  Refresh,
  TableChart,
  Code,
  BarChart,
  Download,
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import { QueryResult } from '../services/api';

interface ResultsPanelProps {
  result: QueryResult | null;
  isExecuting: boolean;
  onRerun: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  isExecuting,
  onRerun,
}) => {
  const [activeTab, setActiveTab] = React.useState(0);

  const handleCopySql = () => {
    if (result?.generatedSql) {
      navigator.clipboard.writeText(result.generatedSql);
      toast.success('SQL copied to clipboard!');
    }
  };

  const handleDownloadCSV = () => {
    if (!result?.rows || result.rows.length === 0) return;

    const headers = result.columns || Object.keys(result.rows[0]);
    const csvContent = [
      headers.join(','),
      ...result.rows.map(row =>
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value).includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV downloaded!');
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isExecuting) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Generating SQL and executing query...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This may take a few moments
        </Typography>
      </Paper>
    );
  }

  if (!result) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <BarChart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No results yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter a natural language query and click "Generate SQL" to see results
        </Typography>
      </Paper>
    );
  }

  if (!result.success) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Error executing query:</Typography>
          <Typography variant="body2">{result.error}</Typography>
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" p={2} pb={0}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Results
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip
              icon={<TableChart fontSize="small" />}
              label={`${result.rowCount} rows`}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              label={formatExecutionTime(result.executionTime)}
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Tooltip title="Copy SQL">
              <IconButton onClick={handleCopySql} size="small">
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download CSV">
              <IconButton onClick={handleDownloadCSV} size="small" disabled={result.rowCount === 0}>
                <Download fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rerun query">
              <IconButton onClick={onRerun} size="small">
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab icon={<TableChart />} label="Data" />
          <Tab icon={<Code />} label="SQL" />
          <Tab icon={<BarChart />} label="Stats" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {result.columns?.map((column, index) => (
                    <TableCell key={index}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {column}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {result.rows?.slice(0, 100).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {result.columns?.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {row[column] !== null && row[column] !== undefined
                          ? String(row[column])
                          : <Typography color="text.secondary" fontStyle="italic">NULL</Typography>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {result.rowCount > 100 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Showing first 100 rows of {result.rowCount} total rows
              </Alert>
            )}
          </TableContainer>
        )}

        {activeTab === 1 && (
          <Box>
            <SyntaxHighlighter
              language="sql"
              style={vscDarkPlus}
              customStyle={{
                borderRadius: 8,
                fontSize: '14px',
                margin: 0,
              }}
            >
              {result.generatedSql}
            </SyntaxHighlighter>
          </Box>
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Query Statistics
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {result.rowCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rows Returned
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {formatExecutionTime(result.executionTime)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Execution Time
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {result.columns?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Columns
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

function Collapse({ in: inProp, children }: any) {
  return inProp ? <>{children}</> : null;
}

export default ResultsPanel;