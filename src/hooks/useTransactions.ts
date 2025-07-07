import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Transaction {
  _id: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const useTransactions = (userId = 'default_user') => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (params: any = {}) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.transactions.getAll({ userId, ...params });
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction = await api.transactions.create({ ...transaction, userId });
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      await api.transactions.update(id, updates);
      setTransactions(prev => 
        prev.map(t => t._id === id ? { ...t, ...updates } : t)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await api.transactions.delete(id);
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
};