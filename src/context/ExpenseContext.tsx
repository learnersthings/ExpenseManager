import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from './AuthContext';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  currency: string;
  monthlyBudget: number;
  yearlyBudget: number;
  addExpense: (amount: number, description: string, date: Date, categoryId?: string) => Promise<void>;
  updateExpense: (id: string, amount: number, description: string, date: Date, categoryId?: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  
  addCategory: (name: string, icon: string, color: string) => Promise<void>;
  updateCategory: (id: string, name: string, icon: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  updateCurrency: (newCurrency: string) => Promise<void>;
  updateBudgets: (monthly: number, yearly: number) => Promise<void>;
  getCurrentMonthTotal: () => number;
  getPreviousMonthTotal: () => number;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  categories: [],
  currency: '$',
  monthlyBudget: 0,
  yearlyBudget: 0,
  addExpense: async () => {},
  updateExpense: async () => {},
  deleteExpense: async () => {},
  addCategory: async () => {},
  updateCategory: async () => {},
  deleteCategory: async () => {},
  updateCurrency: async () => {},
  updateBudgets: async () => {},
  getCurrentMonthTotal: () => 0,
  getPreviousMonthTotal: () => 0,
  isLoading: true,
});

export const useExpenseContext = () => useContext(ExpenseContext);

const EXPENSES_KEY = '@app_expenses';
const CATEGORIES_KEY = '@app_categories';
const CURRENCY_KEY = '@app_currency';
const BUDGET_KEY = '@app_budgets';

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState('$');
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [yearlyBudget, setYearlyBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  const storageKey = user ? `${EXPENSES_KEY}_${user.email}` : EXPENSES_KEY;
  const categoriesStorageKey = user ? `${CATEGORIES_KEY}_${user.email}` : CATEGORIES_KEY;
  const currencyStorageKey = user ? `${CURRENCY_KEY}_${user.email}` : CURRENCY_KEY;
  const budgetStorageKey = user ? `${BUDGET_KEY}_${user.email}` : BUDGET_KEY;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const storedExpenses = await AsyncStorage.getItem(storageKey);
        if (storedExpenses) {
          setExpenses(JSON.parse(storedExpenses));
        }

        const storedCategories = await AsyncStorage.getItem(categoriesStorageKey);
        
        // Wipe existing defaults since user requested empty state
        if (storedCategories && JSON.parse(storedCategories).length === 5 && JSON.parse(storedCategories)[0].name === 'Food') {
          await AsyncStorage.removeItem(categoriesStorageKey);
          setCategories([]);
        } else if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          setCategories([]);
        }

        const storedCurrency = await AsyncStorage.getItem(currencyStorageKey);
        if (storedCurrency) {
          setCurrency(storedCurrency);
        }

        const storedBudgets = await AsyncStorage.getItem(budgetStorageKey);
        if (storedBudgets) {
          const parsed = JSON.parse(storedBudgets);
          if (parsed.monthly) setMonthlyBudget(parsed.monthly);
          if (parsed.yearly) setYearlyBudget(parsed.yearly);
        }
      } catch (e) {
        console.error('Failed to load data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [storageKey, currencyStorageKey, budgetStorageKey]);

  const addExpense = async (amount: number, description: string, date: Date, categoryId?: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      description,
      date: date.toISOString(),
      categoryId,
    };

    const newExpenses = [newExpense, ...expenses];
    newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setExpenses(newExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(newExpenses));
  };

  const updateExpense = async (id: string, amount: number, description: string, date: Date, categoryId?: string) => {
    const updatedExpenses = expenses.map(exp => 
      exp.id === id 
        ? { ...exp, amount, description, date: date.toISOString(), categoryId } 
        : exp
    );
    
    // Sort by date descending in case the date was changed
    updatedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setExpenses(updatedExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
  };

  const deleteExpense = async (id: string) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(updatedExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
  };

  const addCategory = async (name: string, icon: string, color: string) => {
    const newCat: Category = { id: Date.now().toString(), name, icon, color };
    const updated = [...categories, newCat];
    setCategories(updated);
    await AsyncStorage.setItem(categoriesStorageKey, JSON.stringify(updated));
  };

  const updateCategory = async (id: string, name: string, icon: string, color: string) => {
    const updated = categories.map(cat => cat.id === id ? { ...cat, name, icon, color } : cat);
    setCategories(updated);
    await AsyncStorage.setItem(categoriesStorageKey, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(cat => cat.id !== id);
    setCategories(updated);
    await AsyncStorage.setItem(categoriesStorageKey, JSON.stringify(updated));
  };

  const updateCurrency = async (newCurrency: string) => {
    setCurrency(newCurrency);
    await AsyncStorage.setItem(currencyStorageKey, newCurrency);
  };

  const updateBudgets = async (monthly: number, yearly: number) => {
    setMonthlyBudget(monthly);
    setYearlyBudget(yearly);
    await AsyncStorage.setItem(budgetStorageKey, JSON.stringify({ monthly, yearly }));
  };

  const getCurrentMonthTotal = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses
      .filter((expense) => {
        const expDate = new Date(expense.date);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getPreviousMonthTotal = () => {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    return expenses
      .filter((expense) => {
        const expDate = new Date(expense.date);
        return expDate.getMonth() === prevMonth && expDate.getFullYear() === prevYear;
      })
      .reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <ExpenseContext.Provider value={{ 
      expenses, categories, currency, monthlyBudget, yearlyBudget, 
      addExpense, updateExpense, deleteExpense, 
      addCategory, updateCategory, deleteCategory,
      updateCurrency, updateBudgets, 
      getCurrentMonthTotal, getPreviousMonthTotal, isLoading 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
