import React, { useState } from 'react';
import {
  Container,
  Box,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu,
  Settings,
  GitHub,
  Dataset,
  QueryStats,
  History,
  Help,
} from '@mui/icons-material';
import ConnectionPanel from './components/ConnectionPanel';
import TableSelector from './components/TableSelector';
import QueryInput from './components/QueryInput';
import ResultsPanel from './components/ResultsPanel';
import { queryApi, QueryResult } from './services/api';
import toast from 'react-hot-toast';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionString, setConnectionString] = useState<string>('');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      setSelectedTables([]);
      setQueryResult(null);
    }
  };

  const handleExecuteQuery = async (naturalLanguageQuery: string) => {
    if (!connectionString || selectedTables.length === 0) return;

    setIsExecuting(true);
    setQueryResult(null);

    try {
      const request = {
        naturalLanguageQuery,
        selectedTables,
        connectionString,
      };

      const response = await queryApi.executeNaturalLanguage(request);
      setQueryResult(response.data);

      if (!response.data.success) {
        toast.error(`Query failed: ${response.data.error}`);
      } else {
        toast.success(`Query executed successfully in ${(response.data.executionTime / 1000).toFixed(2)}s`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to execute query');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRerunQuery = () => {
    if (queryResult?.generatedSql) {
      // Here you could re-execute the same SQL or regenerate from natural language
      toast.success('Re-executing query...');
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Dataset sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Text to SQL Converter
            </Typography>
            <Typography variant="caption" sx={{ ml: 2, opacity: 0.8 }}>
              Natural Language to SQL with AI
            </Typography>
          </Box>
          <Box>
            <Tooltip title="Settings">
              <IconButton color="inherit">
                <Settings />
              </IconButton>
            </Tooltip>
            <Tooltip title="GitHub">
              <IconButton
                color="inherit"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <GitHub />
              </IconButton>
            </Tooltip>
            <Tooltip title="Help">
              <IconButton color="inherit">
                <Help />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          <ListItem button>
            <ListItemIcon>
              <QueryStats />
            </ListItemIcon>
            <ListItemText primary="Query History" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <Dataset />
            </ListItemIcon>
            <ListItemText primary="Saved Connections" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <History />
            </ListItemIcon>
            <ListItemText primary="Recent Queries" />
          </ListItem>
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Left Column - Connection & Tables */}
            <Grid item xs={12} md={4}>
              <ConnectionPanel
                onConnectionChange={handleConnectionChange}
                connectionString={connectionString}
                onConnectionStringChange={setConnectionString}
              />
              <TableSelector
                connectionString={connectionString}
                selectedTables={selectedTables}
                onTableSelectionChange={setSelectedTables}
                isConnected={isConnected}
              />
            </Grid>

            {/* Right Column - Query Input & Results */}
            <Grid item xs={12} md={8}>
              <QueryInput
                onExecuteQuery={handleExecuteQuery}
                selectedTables={selectedTables}
                isExecuting={isExecuting}
              />
              <ResultsPanel
                result={queryResult}
                isExecuting={isExecuting}
                onRerun={handleRerunQuery}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Powered by Semantic Kernel & DeepSeek LLM via OpenRouter • 
              Converts natural language to SQL queries
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default App;