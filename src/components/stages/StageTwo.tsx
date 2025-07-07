import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  ShoppingCart, 
  Home, 
  Car, 
  Utensils, 
  GamepadIcon, 
  Plane, 
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { api } from '@/lib/api';

export const StageTwo = () => {
  const { transactions, loading } = useTransactions();
  const { categories } = useCategories();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  // Process transactions into category data
  useEffect(() => {
    if (transactions.length > 0) {
      const categoryTotals = transactions.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            value: 0,
            transactions: 0,
            color: categories.find(c => c.name === category)?.color || '#45B7D1'
          };
        }
        acc[category].value += transaction.amount;
        acc[category].transactions += 1;
        return acc;
      }, {});

      setCategoryData(Object.values(categoryTotals));
    }
  }, [transactions, categories]);

  // Fetch monthly trends
  useEffect(() => {
    const fetchMonthlyTrends = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const data = await api.transactions.getMonthlyTotals(currentYear);
        
        // Get category breakdown for each month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendsData = [];

        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(currentYear, i, 1).toISOString();
          const monthEnd = new Date(currentYear, i + 1, 0).toISOString();
          
          try {
            const categoryTotals = await api.transactions.getCategoryTotals(monthStart, monthEnd);
            const monthData = { month: months[i] };
            
            categoryTotals.forEach(cat => {
              monthData[cat._id] = cat.total;
            });
            
            trendsData.push(monthData);
          } catch (error) {
            trendsData.push({ month: months[i] });
          }
        }
        
        setMonthlyTrends(trendsData);
      } catch (error) {
        console.error('Failed to fetch monthly trends:', error);
      }
    };

    if (transactions.length > 0) {
      fetchMonthlyTrends();
    }
  }, [transactions]);
  
  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.value, 0);
  const averagePerCategory = totalSpent / (categoryData.length || 1);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading category data...</div>
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
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            Stage 2
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Categories & Insights</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Organize your expenses by category and discover your spending patterns with interactive visualizations.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Monthly Expenses</p>
                  <p className="text-2xl font-bold text-foreground">${totalSpent.toFixed(2)}</p>
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
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Categories</p>
                  <p className="text-2xl font-bold text-foreground">{categoryData.length}</p>
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
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg per Category</p>
                  <p className="text-2xl font-bold text-foreground">${averagePerCategory.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {categoryData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">No expense data available yet.</p>
          <p className="text-sm text-muted-foreground">Add some transactions in Stage 1 to see category insights!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Category Pie Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
                <CardHeader>
                  <CardTitle>Expense Distribution</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Click on categories to highlight them
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke={selectedCategories.includes(entry.name) ? '#fff' : 'none'}
                              strokeWidth={selectedCategories.includes(entry.name) ? 3 : 0}
                              style={{
                                filter: selectedCategories.length === 0 || selectedCategories.includes(entry.name) 
                                  ? 'brightness(1)' 
                                  : 'brightness(0.3)',
                                cursor: 'pointer'
                              }}
                              onClick={() => toggleCategory(entry.name)}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card-glass))',
                            border: '1px solid hsl(var(--border-glass))',
                            borderRadius: '12px',
                            backdropFilter: 'blur(20px)',
                            boxShadow: 'var(--shadow-glass)'
                          }}
                          formatter={(value: any) => [`$${value}`, 'Amount']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Detailed view of your spending categories
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, index) => {
                      const percentage = (category.value / totalSpent) * 100;
                      const isSelected = selectedCategories.includes(category.name);
                      
                      return (
                        <motion.div
                          key={category.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                            isSelected 
                              ? 'bg-card-glass/80 border-border-glass shadow-glass-strong' 
                              : 'bg-card-glass/30 border-border-glass/50 hover:bg-card-glass/50'
                          }`}
                          onClick={() => toggleCategory(category.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${category.color}20` }}
                              >
                                <DollarSign className="w-5 h-5" style={{ color: category.color }} />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{category.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {category.transactions} transactions
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-lg font-bold text-foreground">
                                ${category.value.toFixed(2)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="mt-3 h-2 bg-muted/30 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: category.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Trends */}
          {monthlyTrends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="bg-gradient-surface backdrop-blur-glass border-border-glass shadow-glass">
                <CardHeader>
                  <CardTitle>Category Trends</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Monthly spending trends across your categories
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrends}>
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
                        {categoryData.slice(0, 4).map((category, index) => (
                          <Bar 
                            key={category.name}
                            dataKey={category.name} 
                            fill={category.color} 
                            radius={[4, 4, 0, 0]} 
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
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