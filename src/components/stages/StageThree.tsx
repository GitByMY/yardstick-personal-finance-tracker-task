import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  PlusCircle,
  DollarSign
} from 'lucide-react';
import { useBudgets, Budget } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

interface BudgetInsight {
  category: string;
  message: string;
  type: 'warning' | 'success' | 'info';
  percentage: number;
}

export const StageThree = () => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  const { budgets, loading, addBudget } = useBudgets('default_user', currentMonth, currentYear);
  const { categories } = useCategories();
  const { transactions } = useTransactions();
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [budgetVsActualData, setBudgetVsActualData] = useState([]);
  const [savingsGoalData, setSavingsGoalData] = useState([]);

  // Calculate spent amounts for each budget based on actual transactions
  const budgetsWithSpent = budgets.map(budget => {
    const categoryTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.category === budget.category &&
             transactionDate.getMonth() + 1 === budget.month &&
             transactionDate.getFullYear() === budget.year;
    });
    
    const actualSpent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      ...budget,
      spentAmount: actualSpent
    };
  });

  // Fetch budget vs actual data
  useEffect(() => {
    const fetchBudgetVsActual = async () => {
      try {
        const data = await api.budgets.getBudgetVsActual(currentYear);
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const chartData = months.map((month, index) => {
          const monthData = data.find(d => d._id === index + 1);
          return {
            month,
            budget: monthData ? monthData.totalBudget : 0,
            actual: monthData ? monthData.totalSpent : 0
          };
        });
        
        setBudgetVsActualData(chartData);
      } catch (error) {
        console.error('Failed to fetch budget vs actual data:', error);
      }
    };

    fetchBudgetVsActual();
  }, [budgets, currentYear]);

  // Generate mock savings goal data (you can replace this with real data)
  useEffect(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const mockSavingsData = months.map(month => ({
      month,
      target: 500,
      saved: Math.floor(Math.random() * 600) + 200
    }));
    setSavingsGoalData(mockSavingsData);
  }, []);

  const generateInsights = (): BudgetInsight[] => {
    return budgetsWithSpent.map(budget => {
      const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
      
      if (percentage > 100) {
        return {
          category: budget.category,
          message: `Exceeded by $${(budget.spentAmount - budget.budgetAmount).toFixed(2)}`,
          type: 'warning',
          percentage
        };
      } else if (percentage > 80) {
        return {
          category: budget.category,
          message: `${percentage.toFixed(0)}% of budget used`,
          type: 'info',
          percentage
        };
      } else {
        return {
          category: budget.category,
          message: `${(100 - percentage).toFixed(0)}% budget remaining`,
          type: 'success',
          percentage
        };
      }
    });
  };

  const insights = generateInsights();
  const totalBudget = budgetsWithSpent.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleAddBudget = async () => {
    if (!newBudget.category || !newBudget.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await addBudget({
        category: newBudget.category,
        budgetAmount: parseFloat(newBudget.amount),
        month: currentMonth,
        year: currentYear,
        userId: 'default_user'
      });
      
      setNewBudget({ category: '', amount: '' });
      setIsDialogOpen(false);
      toast.success('Budget added successfully!');
    } catch (error) {
      toast.error('Failed to add budget');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading budget data...</div>
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
          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
            Stage 3
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Budget Management</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Set budgets, track your progress, and get personalized insights to achieve your financial goals.
        </p>
      </motion.div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">${totalBudget.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  totalRemaining >= 0 ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {totalRemaining >= 0 ? (
                    <CheckCircle className="w-6 h-6 text-success" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-2xl font-bold ${
                    totalRemaining >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    ${Math.abs(totalRemaining).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass cursor-pointer hover:shadow-glass-strong transition-all duration-300 group">
                <CardContent className="p-6 flex items-center justify-center">
                  <div className="text-center">
                    <PlusCircle className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <p className="font-semibold text-primary">Add Budget</p>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-gradient-surface backdrop-blur-glass border-border-glass">
              <DialogHeader>
                <DialogTitle>Set New Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={newBudget.category}
                    onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
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
                <div>
                  <Label htmlFor="amount">Monthly Budget</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                    className="bg-card-glass/50 border-border-glass"
                  />
                </div>
                <Button 
                  onClick={handleAddBudget}
                  className="w-full bg-gradient-primary"
                >
                  Add Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>

      {/* Budget Progress */}
      {budgetsWithSpent.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">No budgets set yet.</p>
          <p className="text-sm text-muted-foreground">Click "Add Budget" above to create your first budget!</p>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-8"
          >
            <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Budget Progress</CardTitle>
                  <Button variant="outline" size="sm" className="bg-card-glass/50 border-border-glass">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {budgetsWithSpent.map((budget, index) => {
                    const percentage = Math.min((budget.spentAmount / budget.budgetAmount) * 100, 100);
                    const isOverBudget = budget.spentAmount > budget.budgetAmount;
                    const categoryInfo = categories.find(c => c.name === budget.category);
                    
                    return (
                      <motion.div
                        key={budget._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="p-4 bg-card-glass/30 rounded-lg border border-border-glass/50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${categoryInfo?.color || '#45B7D1'}20` }}
                            >
                              <DollarSign className="w-5 h-5" style={{ color: categoryInfo?.color || '#45B7D1' }} />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{budget.category}</p>
                              <p className="text-sm text-muted-foreground">
                                ${budget.spentAmount.toFixed(2)} / ${budget.budgetAmount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          
                          <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                            {percentage.toFixed(0)}%
                          </Badge>
                        </div>
                        
                        <Progress 
                          value={percentage} 
                          className={`h-3 ${isOverBudget ? '[&>div]:bg-destructive' : ''}`}
                        />
                        
                        <p className={`text-sm mt-2 ${
                          isOverBudget ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          {isOverBudget 
                            ? `Over budget by $${(budget.spentAmount - budget.budgetAmount).toFixed(2)}`
                            : `$${(budget.budgetAmount - budget.spentAmount).toFixed(2)} remaining`
                          }
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Budget vs Actual Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Compare your planned budget with actual spending
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetVsActualData}>
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
                        <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Budget" />
                        <Bar dataKey="actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Savings Goal Tracking */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
                <CardHeader>
                  <CardTitle>Savings Goal Progress</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track your monthly savings target
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={savingsGoalData}>
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
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          name="Target"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="saved" 
                          stroke="hsl(var(--success))" 
                          strokeWidth={3}
                          name="Saved"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
                <CardHeader>
                  <CardTitle>Financial Insights</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Personalized recommendations based on your spending patterns
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.map((insight, index) => (
                      <motion.div
                        key={insight.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          insight.type === 'warning' 
                            ? 'bg-destructive/5 border-destructive/20' 
                            : insight.type === 'success'
                            ? 'bg-success/5 border-success/20'
                            : 'bg-primary/5 border-primary/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-destructive" />}
                          {insight.type === 'success' && <CheckCircle className="w-5 h-5 text-success" />}
                          {insight.type === 'info' && <TrendingUp className="w-5 h-5 text-primary" />}
                          
                          <div>
                            <p className="font-semibold text-foreground">{insight.category}</p>
                            <p className={`text-sm ${
                              insight.type === 'warning' 
                                ? 'text-destructive' 
                                : insight.type === 'success'
                                ? 'text-success'
                                : 'text-primary'
                            }`}>
                              {insight.message}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};