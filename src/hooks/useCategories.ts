import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface Category {
  _id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const useCategories = (userId = 'default_user') => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.categories.getAll(userId);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCategory = await api.categories.create({ ...category, userId });
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await api.categories.update(id, updates);
      setCategories(prev => 
        prev.map(c => c._id === id ? { ...c, ...updates } : c)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await api.categories.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      throw err;
    }
  };

  const initializeDefaultCategories = async () => {
    try {
      await api.categories.initialize(userId);
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize categories');
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [userId]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    initializeDefaultCategories,
  };
};