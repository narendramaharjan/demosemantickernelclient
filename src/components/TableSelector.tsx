import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Chip,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TableChart,
  Search,
  Refresh,
  Info,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { databaseApi, DatabaseTable } from '../services/api';

interface TableSelectorProps {
  connectionString?: string;
  selectedTables: string[];
  onTableSelectionChange: (tables: string[]) => void;
  isConnected: boolean;
}

const TableSelector: React.FC<TableSelectorProps> = ({
  connectionString,
  selectedTables,
  onTableSelectionChange,
  isConnected,
}) => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [filteredTables, setFilteredTables] = useState<DatabaseTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isConnected && connectionString) {
      loadTables();
    } else {
      setTables([]);
      setFilteredTables([]);
    }
  }, [isConnected, connectionString]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = tables.filter(table =>
        table.tableName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        table.schema.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTables(filtered);
    } else {
      setFilteredTables(tables);
    }
  }, [searchQuery, tables]);

  const loadTables = async () => {
    if (!connectionString) return;

    setIsLoading(true);
    try {
      const response = await databaseApi.getTables(connectionString);
      setTables(response.data);
      setFilteredTables(response.data);
    } catch (error) {
      toast.error('Failed to load tables');
      console.error('Error loading tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableToggle = (tableFullName: string) => {
    const newSelected = selectedTables.includes(tableFullName)
      ? selectedTables.filter(t => t !== tableFullName)
      : [...selectedTables, tableFullName];
    onTableSelectionChange(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTables.length === filteredTables.length) {
      onTableSelectionChange([]);
    } else {
      const allTables = filteredTables.map(t => `${t.schema}.${t.tableName}`);
      onTableSelectionChange(allTables);
    }
  };

  const getTableInfo = (table: DatabaseTable) => {
    const columns = table.columns.length;
    const primaryKeys = table.columns.filter(c => c.isPrimaryKey).length;
    const foreignKeys = table.columns.filter(c => c.isForeignKey).length;
    return `${columns} columns, ${primaryKeys} PK, ${foreignKeys} FK`;
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          <TableChart sx={{ mr: 1 }} />
          <Typography variant="h6">Database Tables</Typography>
          <Chip
            label={`${selectedTables.length} selected`}
            size="small"
            color="primary"
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          <Tooltip title="Refresh tables">
            <IconButton onClick={loadTables} disabled={isLoading || !isConnected}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {!isConnected ? (
        <Alert severity="info">
          Please connect to a database to view tables
        </Alert>
      ) : (
        <>
          <TextField
            fullWidth
            placeholder="Search tables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ mb: 2 }}
            disabled={isLoading}
          />

          <Box display="flex" alignItems="center" mb={1}>
            <Checkbox
              checked={filteredTables.length > 0 && selectedTables.length === filteredTables.length}
              indeterminate={selectedTables.length > 0 && selectedTables.length < filteredTables.length}
              onChange={handleSelectAll}
              disabled={isLoading}
            />
            <Typography variant="body2" color="text.secondary">
              Select All
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
              {filteredTables.length} tables
            </Typography>
          </Box>

          <Box sx={{ height: 400, overflow: 'auto' }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : filteredTables.length === 0 ? (
              <Alert severity="info">
                {searchQuery ? 'No tables found matching your search' : 'No tables found in database'}
              </Alert>
            ) : (
              <List dense>
                {filteredTables.map((table) => {
                  const fullName = `${table.schema}.${table.tableName}`;
                  const isSelected = selectedTables.includes(fullName);

                  return (
                    <ListItem
                      key={fullName}
                      dense
                      button
                      onClick={() => handleTableToggle(fullName)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        bgcolor: isSelected ? 'primary.dark' : 'transparent',
                        '&:hover': {
                          bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {table.tableName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              ({table.schema})
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                              {getTableInfo(table)}
                            </Typography>
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={(e) => {
                                e.stopPropagation();
                                toast.success(`Table: ${fullName}\nColumns: ${table.columns.length}`);
                              }}>
                                <Info fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default TableSelector;