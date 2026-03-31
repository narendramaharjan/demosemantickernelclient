import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip,
  Collapse,
} from '@mui/material';
import {
  Send,
  AutoAwesome,
  Code,
  History,
  Clear,
  Help,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

interface QueryInputProps {
  onExecuteQuery: (query: string) => void;
  selectedTables: string[];
  isExecuting: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({
  onExecuteQuery,
  selectedTables,
  isExecuting,
}) => {
  const [query, setQuery] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }
    if (selectedTables.length === 0) {
      toast.error('Please select at least one table');
      return;
    }
    onExecuteQuery(query);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    toast.success('Example query loaded. Click "Generate SQL" to execute.');
  };

  const handleClear = () => {
    setQuery('');
  };

  const examples = [
    {
      title: 'Simple Select',
      query: 'Show me all patients',
    },
    {
      title: 'Filter Results',
      query: 'Get doctors who specialize in Cardiology',
    },
    {
      title: 'Aggregate Query',
      query: 'Count the number of appointments per doctor',
    },
    {
      title: 'Join Query',
      query: 'Show patients with their doctors and upcoming appointments',
    },
    {
      title: 'Date Filter',
      query: 'Find appointments scheduled for next week',
    },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <AutoAwesome sx={{ mr: 1 }} />
        <Typography variant="h6">Natural Language Query</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Show examples">
          <IconButton onClick={() => setShowExamples(!showExamples)} size="small">
            <Help />
          </IconButton>
        </Tooltip>
      </Box>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          placeholder="Ask a question in plain English... (e.g., 'Show me all patients with upcoming appointments')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
          disabled={isExecuting}
          InputProps={{
            endAdornment: query && (
              <IconButton onClick={handleClear} size="small">
                <Clear />
              </IconButton>
            ),
          }}
        />

        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={isExecuting || !query.trim() || selectedTables.length === 0}
            startIcon={
              isExecuting ? (
                <CircularProgress size={20} />
              ) : (
                <Send />
              )
            }
            sx={{ minWidth: 150 }}
          >
            {isExecuting ? 'Generating...' : 'Generate SQL'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Selected tables: {selectedTables.length}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() => setQuery('')}
            size="small"
          >
            Clear
          </Button>
        </Box>

        {selectedTables.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please select at least one table from the Tables panel
          </Alert>
        )}
      </form>

      <Collapse in={showExamples}>
        <Box mt={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Try these examples:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {examples.map((example, index) => (
              <Chip
                key={index}
                label={example.title}
                onClick={() => handleExampleClick(example.query)}
                icon={<Code fontSize="small" />}
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default QueryInput;