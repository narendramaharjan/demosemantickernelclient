import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Link as LinkIcon,
  CheckCircle,
  Error as ErrorIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { databaseApi } from '../services/api';

interface ConnectionPanelProps {
  onConnectionChange: (isConnected: boolean) => void;
  connectionString?: string;
  onConnectionStringChange: (connectionString: string) => void;
}

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  onConnectionChange,
  connectionString: externalConnectionString,
  onConnectionStringChange,
}) => {
  const [connectionString, setConnectionString] = useState(
    externalConnectionString || 'Server=localhost;Database=master;Trusted_Connection=True;'
  );
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTestConnection = async () => {
    if (!connectionString.trim()) {
      toast.error('Please enter a connection string');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await databaseApi.testConnection(connectionString);
      setTestResult(response.data.isValid);
      if (response.data.isValid) {
        toast.success('Connection successful!');
      } else {
        toast.error('Connection failed');
      }
    } catch (error) {
      setTestResult(false);
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  const handleConnect = async () => {
    if (!connectionString.trim()) {
      toast.error('Please enter a connection string');
      return;
    }

    setIsTesting(true);

    try {
      await databaseApi.connect(connectionString);
      onConnectionStringChange(connectionString);
      onConnectionChange(true);
      toast.success('Connected to database!');
    } catch (error) {
      toast.error('Failed to connect to database');
    } finally {
      setIsTesting(false);
    }
  };

  const handleExampleClick = () => {
    setConnectionString('Server=localhost;Database=RecMng;Trusted_Connection=True;');
  };

  const sampleConnections = [
    {
      name: 'Local SQL Server (Windows Auth)',
      value: 'Server=localhost;Database=RecMng;Trusted_Connection=True;',
    },
    {
      name: 'Local SQL Server (SQL Auth)',
      value: 'Server=localhost;Database=YourDatabase;User Id=sa;Password=YourPassword;',
    },
    {
      name: 'Azure SQL Database',
      value: 'Server=tcp:yourserver.database.windows.net,1433;Database=YourDatabase;User Id=YourUsername;Password=YourPassword;Encrypt=True;TrustServerCertificate=False;',
    },
  ];

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <LinkIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Database Connection</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={() => setIsExpanded(!isExpanded)} size="small">
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <TextField
        fullWidth
        label="Connection String"
        value={connectionString}
        onChange={(e) => {
          setConnectionString(e.target.value);
          onConnectionStringChange(e.target.value);
        }}
        placeholder="Server=localhost;Database=master;Trusted_Connection=True;"
        multiline
        rows={2}
        variant="outlined"
        sx={{ mb: 2 }}
        disabled={isTesting}
      />

      <Collapse in={isExpanded}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Sample Connection Strings:
          </Typography>
          {sampleConnections.map((conn, index) => (
            <Alert
              key={index}
              severity="info"
              sx={{ mb: 1, cursor: 'pointer' }}
              onClick={() => {
                setConnectionString(conn.value);
                onConnectionStringChange(conn.value);
              }}
            >
              <Typography variant="body2">
                <strong>{conn.name}:</strong> {conn.value}
              </Typography>
            </Alert>
          ))}
        </Box>
      </Collapse>

      <Box display="flex" gap={2} alignItems="center">
        <Button
          variant="outlined"
          onClick={handleTestConnection}
          disabled={isTesting || !connectionString.trim()}
          startIcon={isTesting ? <CircularProgress size={20} /> : null}
        >
          Test Connection
        </Button>

        <Button
          variant="contained"
          onClick={handleConnect}
          disabled={isTesting || !connectionString.trim()}
          startIcon={isTesting ? <CircularProgress size={20} /> : <LinkIcon />}
        >
          Connect
        </Button>

        <Button
          variant="text"
          onClick={handleExampleClick}
          size="small"
        >
          Use Example
        </Button>

        {testResult !== null && (
          <Box display="flex" alignItems="center" ml="auto">
            {testResult ? (
              <>
                <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  Connection OK
                </Typography>
              </>
            ) : (
              <>
                <ErrorIcon sx={{ color: 'error.main', mr: 1 }} />
                <Typography variant="body2" color="error.main">
                  Connection Failed
                </Typography>
              </>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ConnectionPanel;