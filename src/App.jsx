import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Target, CheckCircle2, 
  AlertCircle, Plus, Trash2, RefreshCw, Layers, ShieldCheck, 
  Database, ArrowUpRight, ArrowDownRight, Clock, Award, 
  Sliders, Sparkles, CheckSquare, FileText, ChevronRight 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

// --- INITIAL MOCK DATA (Values in INR / ₹) ---
const INITIAL_TRANSACTIONS = [
  { id: 't1', title: 'Monthly Pocket Money / Stipend', amount: 15000, type: 'income', category: 'Stipend', date: '2026-10-01', sprint: 'Sprint 14' },
  { id: 't2', title: 'Mess & Hostel Fee Advance', amount: 6500, type: 'expense', category: 'Food & Rent', date: '2026-10-02', sprint: 'Sprint 14' },
  { id: 't3', title: 'Engineering Textbooks & Notes', amount: 2450, type: 'expense', category: 'Academics', date: '2026-10-05', sprint: 'Sprint 14' },
  { id: 't4', title: 'Campus Canteen Chai & Snacks', amount: 180, type: 'expense', category: 'Food & Rent', date: '2026-10-08', sprint: 'Sprint 14' },
  { id: 't5', title: 'Freelance Design Gig', amount: 4500, type: 'income', category: 'Side Hustle', date: '2026-10-10', sprint: 'Sprint 14' },
  { id: 't6', title: 'D-Mart Monthly Groceries', amount: 2100, type: 'expense', category: 'Food & Rent', date: '2026-10-12', sprint: 'Sprint 14' },
];

const INITIAL_SPRINTS = [
  { id: 's1', name: 'Sprint 12: Mid-Sem Crunch', budget: 12000, spent: 11400, status: 'Completed', velocityScore: 95 },
  { id: 's2', name: 'Sprint 13: Fest & Outings', budget: 10000, spent: 10800, status: 'Completed', velocityScore: 82 },
  { id: 's3', name: 'Sprint 14: Exam & Project Prep', budget: 12000, spent: 9230, status: 'Active', velocityScore: 91 },
];

const INITIAL_GOALS = [
  { id: 'g1', title: 'New Coding Laptop Upgrade', target: 75000, current: 48000, deadline: '2026-12-31' },
  { id: 'g2', title: 'Emergency Reserve Fund', target: 15000, current: 12500, deadline: '2026-11-15' },
  { id: 'g3', title: 'Semester End Trip to Goa', target: 20000, current: 6500, deadline: '2027-01-20' },
];

const BURNDOWN_DATA = [
  { day: 'Day 1', ideal: 12000, actual: 12000 },
  { day: 'Day 3', ideal: 10280, actual: 11500 },
  { day: 'Day 5', ideal: 8570, actual: 9800 },
  { day: 'Day 7', ideal: 6850, actual: 7400 },
  { day: 'Day 10', ideal: 4280, actual: 6100 },
  { day: 'Day 12', ideal: 2570, actual: 8100 },
  { day: 'Day 14', ideal: 0, actual: 9230 },
];

const CATEGORY_COLORS = {
  'Food & Rent': '#6366f1',
  'Academics': '#3b82f6',
  'Entertainment': '#ec4899',
  'Side Hustle': '#10b981',
  'Stipend': '#14b8a6',
  'Others': '#8b5cf6'
};

export default App;

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [sprints, setSprints] = useState(INITIAL_SPRINTS);
  const [goals, setGoals] = useState(INITIAL_GOALS);
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({ title: '', amount: '', type: 'expense', category: 'Food & Rent' });

  // Supabase mock connection state
  const [supabaseConnected, setSupabaseConnected] = useState(true);
  const [syncLogs, setSyncLogs] = useState([
    { id: 1, time: 'Just now', action: 'Connected to Supabase PostgreSQL', status: 'success' },
    { id: 2, time: '2m ago', action: 'Synced Sprint 14 budget metrics', status: 'success' }
  ]);

  // Calculations
  const totalIncome = useMemo(() => transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const currentBalance = totalIncome - totalExpense;

  const activeSprint = sprints.find(s => s.status === 'Active') || sprints[0];
  const sprintPercentage = Math.min(Math.round((activeSprint.spent / activeSprint.budget) * 100), 100);

  // Category breakdown data for charts
  const categoryData = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.keys(map).map(cat => ({ name: cat, value: map[cat] }));
  }, [transactions]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!newTx.title || !newTx.amount) return;

    const transaction = {
      id: 't_' + Date.now(),
      title: newTx.title,
      amount: parseFloat(newTx.amount),
      type: newTx.type,
      category: newTx.category,
      date: new Date().toISOString().split('T')[0],
      sprint: activeSprint.name
    };

    setTransactions([transaction, ...transactions]);
    
    // If it's an expense, update active sprint spent amount
    if (newTx.type === 'expense') {
      setSprints(sprints.map(s => s.id === activeSprint.id ? { ...s, spent: s.spent + parseFloat(newTx.amount) } : s));
    }

    // Log sync event
    setSyncLogs([
      { id: Date.now(), time: 'Just now', action: `Inserted transaction: ${newTx.title} (₹${newTx.amount})`, status: 'success' },
      ...syncLogs
    ]);

    setNewTx({ title: '', amount: '', type: 'expense', category: 'Food & Rent' });
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
    setSyncLogs([
      { id: Date.now(), time: 'Just now', action: `Deleted transaction ID: ${id}`, status: 'warning' },
      ...syncLogs
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* HEADER / NAVIGATION */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SprintSpend
              </span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20 ml-2 font-mono">
                Agile Finance v2.4
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <NavTab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" />
            <NavTab active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} label="Transactions" />
            <NavTab active={activeTab === 'sprints'} onClick={() => setActiveTab('sprints')} label="Sprint & Burndown" />
            <NavTab active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} label="Savings Goals" />
            <NavTab active={activeTab === 'database'} onClick={() => setActiveTab('database')} label="Supabase Inspector" />
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Supabase Connected</span>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV BAR */}
      <div className="md:hidden flex overflow-x-auto bg-slate-900 border-b border-slate-800 px-2 py-2 space-x-2">
        <MobileNavTab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Dashboard" />
        <MobileNavTab active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} label="Transactions" />
        <MobileNavTab active={activeTab === 'sprints'} onClick={() => setActiveTab('sprints')} label="Sprints" />
        <MobileNavTab active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} label="Goals" />
        <MobileNavTab active={activeTab === 'database'} onClick={() => setActiveTab('database')} label="Database" />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* TOP METRIC CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Current Balance" 
                amount={`₹${currentBalance.toLocaleString('en-IN')}`} 
                trend="+12.4% vs last sprint" 
                isPositive={true} 
                icon={<Wallet className="w-6 h-6 text-indigo-400" />} 
                bgGradient="from-indigo-900/20 to-indigo-950/40"
              />
              <MetricCard 
                title="Sprint Inflow" 
                amount={`₹${totalIncome.toLocaleString('en-IN')}`} 
                trend="Stipend & Gigs" 
                isPositive={true} 
                icon={<ArrowDownRight className="w-6 h-6 text-emerald-400" />} 
                bgGradient="from-emerald-900/20 to-emerald-950/40"
              />
              <MetricCard 
                title="Sprint Outflow" 
                amount={`₹${totalExpense.toLocaleString('en-IN')}`} 
                trend="Food, Books & Rent" 
                isPositive={false} 
                icon={<ArrowUpRight className="w-6 h-6 text-rose-400" />} 
                bgGradient="from-rose-900/20 to-rose-950/40"
              />
              <MetricCard 
                title="Active Sprint Velocity" 
                amount={`${activeSprint.velocityScore}%`} 
                trend="Budget efficiency score" 
                isPositive={true} 
                icon={<Award className="w-6 h-6 text-amber-400" />} 
                bgGradient="from-amber-900/20 to-amber-950/40"
              />
            </div>

            {/* CURRENT SPRINT STATUS BANNER */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2.5 py-1 rounded-md font-mono border border-indigo-500/30">
                      CURRENT SPRINT
                    </span>
                    <h2 className="text-xl font-bold text-white">{activeSprint.name}</h2>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">Budget burn rate is optimal. 4 days remaining in current cycle.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400">Spent / Allocated</div>
                  <div className="text-2xl font-extrabold text-white">
                    ₹{activeSprint.spent.toLocaleString('en-IN')} <span className="text-sm text-slate-500 font-normal">/ ₹{activeSprint.budget.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${sprintPercentage > 90 ? 'bg-rose-500' : sprintPercentage > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                  style={{ width: `${sprintPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-slate-400 font-mono">
                <span>0% Burned</span>
                <span>{sprintPercentage}% Budget Utilized</span>
                <span>100% Limit</span>
              </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Burndown Chart Preview */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Sprint Burndown Trend</h3>
                    <p className="text-xs text-slate-400">Comparing ideal budget slope vs. actual student spending</p>
                  </div>
                  <button onClick={() => setActiveTab('sprints')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
                    <span>View Sprint Board</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={BURNDOWN_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                      <Legend />
                      <Line type="monotone" dataKey="ideal" stroke="#6366f1" strokeWidth={2} name="Ideal Budget (₹)" dot={false} />
                      <Line type="monotone" dataKey="actual" stroke="#ec4899" strokeWidth={3} name="Actual Spent (₹)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense Breakdown Pie Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Expense Categories</h3>
                  <p className="text-xs text-slate-400 mb-4">Distribution across student verticals</p>
                </div>
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {categoryData.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#6366f1' }}></span>
                        <span className="text-slate-300">{item.name}</span>
                      </span>
                      <span className="font-mono font-semibold text-white">₹{item.value.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Transaction Ledger</h2>
                <p className="text-sm text-slate-400">All income and expenses logged via Supabase Edge API</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Record</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs font-mono uppercase bg-slate-950/50">
                      <th className="py-4 px-6">Description</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Sprint</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6 text-right">Amount</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-sm">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 font-medium text-white flex items-center space-x-3">
                          <span className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {t.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </span>
                          <span>{t.title}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 font-mono text-xs">{t.sprint}</td>
                        <td className="py-4 px-6 text-slate-400 font-mono text-xs">{t.date}</td>
                        <td className={`py-4 px-6 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SPRINTS & BURNDOWN */}
        {activeTab === 'sprints' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">Agile Budget Sprints</h2>
              <p className="text-sm text-slate-400 mb-6">Manage your finances in strict 2-week student iteration cycles.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sprints.map(s => (
                  <div key={s.id} className={`p-6 rounded-2xl border ${s.status === 'Active' ? 'bg-indigo-950/20 border-indigo-500/40 shadow-lg shadow-indigo-500/10' : 'bg-slate-950/40 border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-xs px-2.5 py-1 rounded-md font-mono ${s.status === 'Active' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-400'}`}>
                        {s.status.toUpperCase()}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Velocity: {s.velocityScore}%</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Allocated Budget</span>
                        <span className="font-mono text-white font-semibold">₹{s.budget.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Total Spent</span>
                        <span className="font-mono text-rose-400 font-semibold">₹{s.spent.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${s.spent > s.budget ? 'bg-rose-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(Math.round((s.spent / s.budget) * 100), 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAVINGS GOALS */}
        {activeTab === 'goals' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">Student Savings Backlog</h2>
              <p className="text-sm text-slate-400 mb-6">Long-term targets and milestone funds.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {goals.map(g => {
                  const percent = Math.min(Math.round((g.current / g.target) * 100), 100);
                  return (
                    <div key={g.id} className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                            <Target className="w-5 h-5" />
                          </span>
                          <span className="text-xs font-mono text-slate-400">Due {g.deadline}</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{g.title}</h3>
                        <div className="text-2xl font-black text-indigo-400 mb-4">
                          ₹{g.current.toLocaleString('en-IN')} <span className="text-xs text-slate-500 font-normal">/ ₹{g.target.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mb-2">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full" style={{ width: `${percent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 font-mono">
                          <span>{percent}% Saved</span>
                          <span>₹{(g.target - g.current).toLocaleString('en-IN')} to go</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUPABASE INSPECTOR */}
        {activeTab === 'database' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <Database className="w-5 h-5 text-indigo-400" />
                    <span>Supabase Backend Inspector</span>
                  </h2>
                  <p className="text-sm text-slate-400">Simulated PostgreSQL REST Client & Realtime Sync Logs</p>
                </div>
                <button 
                  onClick={() => setSyncLogs([{ id: Date.now(), time: 'Just now', action: 'Manually refreshed schema state', status: 'success' }, ...syncLogs])}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Schema</span>
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 mb-6">
                <div className="text-slate-500">// Supabase Connection Status</div>
                <div className="text-emerald-400">SUPABASE_URL = "https://xyz-student-finance.supabase.co"</div>
                <div className="text-emerald-400">SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsIn..."</div>
                <div className="text-indigo-400">POSTGRES_TABLE = "public.sprintspend_ledger"</div>
              </div>

              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Realtime Event Stream</h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-900">
                {syncLogs.map(log => (
                  <div key={log.id} className="p-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center space-x-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-300">{log.action}</span>
                    </div>
                    <span className="text-slate-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ADD TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Add New Ledger Record</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Title / Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Canteen Lunch, Freelance Payout" 
                  value={newTx.title}
                  onChange={(e) => setNewTx({...newTx, title: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={newTx.amount}
                    onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Type</label>
                  <select 
                    value={newTx.type}
                    onChange={(e) => setNewTx({...newTx, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="expense">Expense (-)</option>
                    <option value="income">Income (+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Category</label>
                <select 
                  value={newTx.category}
                  onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Food & Rent">Food & Rent</option>
                  <option value="Academics">Academics</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Side Hustle">Side Hustle</option>
                  <option value="Stipend">Stipend</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-slate-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper Components
function NavTab({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
    >
      {label}
    </button>
  );
}

function MobileNavTab({ active, onClick, label }) {
  return (
    <button 
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${active ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-950 border border-slate-800'}`}
    >
      {label}
    </button>
  );
}

function MetricCard({ title, amount, trend, isPositive, icon, bgGradient }) {
  return (
    <div className={`bg-gradient-to-br ${bgGradient} border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-white mb-2">{amount}</div>
      <div className="flex items-center space-x-1.5 text-xs">
        <span className={isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{trend}</span>
      </div>
    </div>
  );
}