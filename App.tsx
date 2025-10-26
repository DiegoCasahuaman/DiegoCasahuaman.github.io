
import React, { useState, useCallback } from 'react';
import { Expense, Category } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import ExpenseForm from './components/ExpenseForm';
import Statistics from './components/Statistics';
import History from './components/History';
import CategoryManager from './components/CategoryManager';
import { MenuIcon } from './components/ui/icons';
import EditExpenseModal from './components/EditExpenseModal';

const initialCategories: Category[] = [
  { id: '1', name: 'Comida' },
  { id: '2', name: 'Transporte' },
  { id: '3', name: 'Ocio' },
  { id: '4', name: 'Hogar' },
  { id: '5', name: 'Salud' },
  { id: '6', name: 'Educación' },
];


const App: React.FC = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', initialCategories);
  const [activeView, setActiveView] = useState('form');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'date'>) => {
    setExpenses(prev => [
      ...prev,
      {
        ...expense,
        id: new Date().getTime().toString(),
        date: new Date().toISOString(),
      },
    ]);
  }, [setExpenses]);

  const editExpense = useCallback((updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    setEditingExpense(null);
  }, [setExpenses]);

  const addCategory = useCallback((name: string) => {
    if (name && !categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        const newCategory: Category = {
            id: new Date().getTime().toString(),
            name,
        };
        setCategories(prev => [...prev, newCategory]);
        return true;
    }
    return false;
  }, [categories, setCategories]);
  
  const editCategory = useCallback((id: string, newName: string) => {
    if (newName && !categories.some(c => c.id !== id && c.name.toLowerCase() === newName.toLowerCase())) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
        return true;
    }
    return false;
  }, [categories, setCategories]);

  const deleteCategory = useCallback((id: string, reassignToId?: string) => {
      const expensesWithCategory = expenses.filter(e => e.categoryId === id);
      if (expensesWithCategory.length > 0 && !reassignToId) {
          // This case is handled in the component, but as a safeguard:
          console.error("Cannot delete category with expenses without reassigning them.");
          return false; 
      }
      
      if (reassignToId) {
          setExpenses(prev => prev.map(e => e.categoryId === id ? { ...e, categoryId: reassignToId } : e));
      }

      setCategories(prev => prev.filter(c => c.id !== id));
      return true;
  }, [expenses, setExpenses, setCategories]);

  const renderView = () => {
    switch (activeView) {
      case 'form':
        return <ExpenseForm categories={categories} addExpense={addExpense} />;
      case 'stats':
        return <Statistics expenses={expenses} categories={categories} />;
      case 'history':
        return <History expenses={expenses} categories={categories} onEditExpense={setEditingExpense} />;
      case 'categories':
        return <CategoryManager 
                    categories={categories} 
                    expenses={expenses}
                    addCategory={addCategory}
                    editCategory={editCategory}
                    deleteCategory={deleteCategory}
                />;
      default:
        return <ExpenseForm categories={categories} addExpense={addExpense} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        setActiveView={setActiveView}
        activeView={activeView}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-300">
            <MenuIcon />
          </button>
          <h1 className="text-xl font-semibold text-gray-300">Control de Gastos</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
             {renderView()}
            </div>
        </main>
      </div>
      {editingExpense && (
        <EditExpenseModal
            expense={editingExpense}
            categories={categories}
            onSave={editExpense}
            onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
};

export default App;