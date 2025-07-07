import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Budget {
  _id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  month: number;
  year: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const useBudgets = (userId = 'default_user', month?: number, year?: number) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { userId };
      if (month !== undefined) params.month = month;
      if (year !== undefined) params.year = year;
      
      const data = await api.budgets.getAll(params);
      setBudgets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const addBudget = async (budget: Omit<Budget, '_id' | 'spentAmount' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBudget = await api.budgets.create({ ...budget, userId });
      setBudgets(prev => [...prev, newBudget]);
      return newBudget;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add budget');
      throw err;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      await api.budgets.update(id, updates);
      setBudgets(prev => 
        prev.map(b => b._id === id ? { ...b, ...updates } : b)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await api.budgets.delete(id);
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget');
      throw err;
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [userId, month, year]);

  return {
    budgets,
    loading,
    error,
    fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
  };
};