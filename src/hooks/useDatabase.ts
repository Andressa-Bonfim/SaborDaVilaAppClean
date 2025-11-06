import { useEffect } from 'react';
import { initializeDatabase } from '../database/database';

export function useDatabase() {
  useEffect(() => {
    initializeDatabase();
  }, []);
}
