import { useState, useEffect, useCallback } from 'react';

export const useEsp32Data = (espIP, isConfiguring) => {
  const [data, setData] = useState({ 
    angle: 0, 
    zone: 'Optimal Posture', 
    pwm: 0 
  });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (isConfiguring) return;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://${espIP}/data`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const json = await response.json();
      setData(json);
      setConnected(true);
      setError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setConnected(false);
      
      if (error.name === 'AbortError') {
        setError('Connection timeout - device not responding');
      } else {
        setError(`Network error: ${error.message}`);
      }
      
      setRetryCount(prev => prev + 1);
    }
  }, [espIP, isConfiguring]);

  useEffect(() => {
    if (isConfiguring) return;

    fetchData();
    
    const interval = setInterval(fetchData, 800);
    
    return () => clearInterval(interval);
  }, [fetchData, isConfiguring]);

  // Auto-retry with backoff
  useEffect(() => {
    if (retryCount > 0 && retryCount <= 3) {
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
      const retryTimer = setTimeout(fetchData, backoffTime);
      return () => clearTimeout(retryTimer);
    }
  }, [retryCount, fetchData]);

  return { data, connected, error, retryCount };
};