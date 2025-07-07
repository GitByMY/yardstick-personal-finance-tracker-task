import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StageOne } from '@/components/stages/StageOne';
import { StageTwo } from '@/components/stages/StageTwo';
import { StageThree } from '@/components/stages/StageThree';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { WalletIcon, PieChart, TrendingUp } from 'lucide-react';

const Index = () => {
  const [currentStage, setCurrentStage] = useState(1);

  const stages = [
    {
      id: 1,
      title: 'Transaction Tracking',
      description: 'Add, edit, and visualize your daily expenses',
      icon: WalletIcon,
      component: StageOne
    },
    {
      id: 2,
      title: 'Categories & Insights',
      description: 'Organize expenses by category with beautiful charts',
      icon: PieChart,
      component: StageTwo
    },
    {
      id: 3,
      title: 'Budget Management',
      description: 'Set budgets and track your financial goals',
      icon: TrendingUp,
      component: StageThree
    }
  ];

  const CurrentStageComponent = stages.find(stage => stage.id === currentStage)?.component || StageOne;

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Connection Status */}
      <ConnectionStatus />
      
      {/* Glass Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-glass to-background-glass-light" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header with stage navigation */}
        <motion.header
          className="p-6 backdrop-blur-glass border-b border-border-glass/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-center lg:text-left">
                <motion.h1 
                  className="text-4xl lg:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Personal Finance Visualizer
                </motion.h1>
                <motion.p 
                  className="text-lg text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Project Under Yardstick's internship evaluation, created by Manmohan Yadav.
                  The Project is made collectively as one, containing all three stages.
                  Try adding data, running visualizations, and managing budgets.
                  Thankyou Team Yardstick this oppotunity.
                </motion.p>
              </div>

              {/* Stage Navigation */}
              <motion.div 
                className="flex flex-wrap justify-center lg:justify-end gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {stages.map((stage, index) => {
                  const Icon = stage.icon;
                  const isActive = currentStage === stage.id;
                  
                  return (
                    <motion.div
                      key={stage.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={isActive ? "default" : "outline"}
                        size="lg"
                        onClick={() => setCurrentStage(stage.id)}
                        className={`relative group transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-primary shadow-glow-primary border-0' 
                            : 'bg-card-glass/50 backdrop-blur-glass border-border-glass hover:bg-card-glass/80 hover:shadow-glass'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={isActive ? "secondary" : "outline"}
                            className={`text-xs ${
                              isActive ? 'bg-white/20 text-white border-white/30' : 'bg-muted/50'
                            }`}
                          >
                            Stage {stage.id}
                          </Badge>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-foreground'}`} />
                          <div className={`text-left ${isActive ? 'text-white' : 'text-foreground'}`}>
                            <div className="font-semibold text-sm">{stage.title}</div>
                            <div className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
                              {stage.description}
                            </div>
                          </div>
                        </div>
                        
                        {/* Glass shine effect */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-lg"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 3,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ 
                duration: 0.5, 
                ease: [0.4, 0, 0.2, 1] 
              }}
            >
              <CurrentStageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;