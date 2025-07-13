import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw, Database, Server } from 'lucide-react';
import { api } from '@/lib/api';

export const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      await api.health();
      setIsConnected(true);
      setLastChecked(new Date());
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return null; // Don't show anything when connected
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 right-4 z-50"
      >
        <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass max-w-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                {isChecking ? (
                  <RefreshCw className="w-5 h-5 text-warning animate-spin" />
                ) : (
                  <WifiOff className="w-5 h-5 text-destructive" />
                )}
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isChecking ? 'Checking...' : 'Disconnected'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Server className="w-4 h-4" />
                <span>Backend Server: {isChecking ? 'Checking...' : isConnected ? 'Online' : 'Offline'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Database className="w-4 h-4" />
                <span>MongoDB: {isChecking ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              {error && (
                <p className="text-destructive text-xs mt-2">
                  {error}
                </p>
              )}
              
              <div className="text-xs text-muted-foreground mt-3">
                To start the backend server, run:
                <code className="block bg-muted/30 p-2 rounded mt-1 font-mono">
                  npm run dev
                </code>
              </div>
            </div>
            
            <Button
              onClick={checkConnection}
              disabled={isChecking}
              size="sm"
              className="w-full mt-3"
              variant="outline"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};