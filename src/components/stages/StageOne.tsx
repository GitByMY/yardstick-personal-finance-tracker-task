import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, Edit3, Calendar, DollarSign, FileText } from 'lucide-react';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

export const StageOne = () => {
  const { transactions, loading, error, addTransaction, deleteTransaction } = useTransactions();
  const { categories, initializeDefaultCategories } = useCategories();
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: ''
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Initialize categories on first load
  useEffect(() => {
    const initializeData = async () => {
      try {
        if (categories.length === 0) {
          await initializeDefaultCategories();
        }
      } catch (error) {
        console.error('Failed to initialize categories:', error);
      }
    };
    initializeData();
  }, [categories.length, initializeDefaultCategories]);

  // Fetch monthly data for chart
  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const data = await api.transactions.getMonthlyTotals(currentYear);
        
        // Transform data for chart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = months.map((month, index) => {
          const monthData = data.find(d => d._id === index + 1);
          return {
            month,
            expenses: monthData ? monthData.total : 0
          };
        });
        
        setMonthlyData(chartData);
      } catch (error) {
        console.error('Failed to fetch monthly data:', error);
      }
    };

    fetchMonthlyData();
  }, [transactions]);

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description || !newTransaction.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await addTransaction({
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description,
        category: newTransaction.category,
        date: newTransaction.date,
        userId: 'default_user'
      });
      
      setNewTransaction({ 
        amount: '', 
        description: '', 
        date: new Date().toISOString().split('T')[0],
        category: ''
      });
      
      toast.success('Transaction added successfully!');
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading transactions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            Stage 1
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Transaction Tracking</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Start by adding your daily expenses. Watch your spending patterns emerge with beautiful visualizations.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Transaction Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Plus className="w-6 h-6 text-primary" />
                Add New Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="bg-card-glass/50 border-border-glass focus:border-primary focus:shadow-glow-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="What did you spend on?"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="bg-card-glass/50 border-border-glass focus:border-primary focus:shadow-glow-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-card-glass/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="bg-card-glass/50 border-border-glass focus:border-primary focus:shadow-glow-primary"
                />
              </div>
              
              <Button 
                onClick={handleAddTransaction}
                className="w-full bg-gradient-primary hover:shadow-glow-primary transition-all duration-300"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Transaction
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Expenses Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
            <CardHeader>
              <CardTitle>Monthly Expenses Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your spending pattern over the last 12 months
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="month" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card-glass))',
                        border: '1px solid hsl(var(--border-glass))',
                        borderRadius: '12px',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'var(--shadow-glass)'
                      }}
                    />
                    <Bar 
                      dataKey="expenses" 
                      fill="url(#barGradient)"
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--primary-glass))" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-8"
      >
        <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Transactions</CardTitle>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Total: ${totalExpenses.toFixed(2)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions yet. Add your first transaction above!
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={transaction._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-card-glass/30 rounded-lg border border-border-glass/50 hover:bg-card-glass/50 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-primary">
                        ${transaction.amount.toFixed(2)}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(transaction._id)}
                          className="hover:bg-primary/10"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction._id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};