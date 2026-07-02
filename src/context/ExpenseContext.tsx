import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from './AuthContext';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string
  categoryId?: string;
  paymentModeId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface PaymentMode {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  paymentModes: PaymentMode[];
  currency: string;
  monthlyBudget: number;
  yearlyBudget: number;
  showMonthlyBudget: boolean;
  showYearlyBudget: boolean;
  addExpense: (amount: number, description: string, date: Date, categoryId?: string, paymentModeId?: string) => Promise<void>;
  updateExpense: (id: string, amount: number, description: string, date: Date, categoryId?: string, paymentModeId?: string) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  bulkDeleteExpenses: (ids: string[]) => Promise<void>;
  
  addCategory: (name: string, icon: string, color: string) => Promise<void>;
  updateCategory: (id: string, name: string, icon: string, color: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  addPaymentMode: (name: string, icon: string, color: string) => Promise<void>;
  updatePaymentMode: (id: string, name: string, icon: string, color: string) => Promise<void>;
  deletePaymentMode: (id: string) => Promise<void>;

  bulkImport: (newExpenses: Expense[], newCategories: Category[], newPaymentModes: PaymentMode[]) => Promise<void>;

  updateCurrency: (newCurrency: string) => Promise<void>;
  updateBudgets: (monthly: number, yearly: number) => Promise<void>;
  toggleShowMonthlyBudget: (val: boolean) => Promise<void>;
  toggleShowYearlyBudget: (val: boolean) => Promise<void>;
  getCurrentMonthTotal: () => number;
  getPreviousMonthTotal: () => number;
  refreshExpenseData: () => Promise<void>;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  categories: [],
  paymentModes: [],
  currency: '$',
  monthlyBudget: 0,
  yearlyBudget: 0,
  showMonthlyBudget: true,
  showYearlyBudget: true,
  addExpense: async () => {},
  updateExpense: async () => {},
  deleteExpense: async () => {},
  bulkDeleteExpenses: async () => {},
  addCategory: async () => {},
  updateCategory: async () => {},
  deleteCategory: async () => {},
  addPaymentMode: async () => {},
  updatePaymentMode: async () => {},
  deletePaymentMode: async () => {},
  bulkImport: async () => {},
  updateCurrency: async () => {},
  updateBudgets: async () => {},
  toggleShowMonthlyBudget: async () => {},
  toggleShowYearlyBudget: async () => {},
  getCurrentMonthTotal: () => 0,
  getPreviousMonthTotal: () => 0,
  refreshExpenseData: async () => {},
  isLoading: true,
});

export const useExpenseContext = () => useContext(ExpenseContext);

const EXPENSES_KEY = '@app_expenses';
const CATEGORIES_KEY = '@app_categories';
const PAYMENT_MODES_KEY = '@app_payment_modes';
const CURRENCY_KEY = '@app_currency';
const BUDGET_KEY = '@app_budgets';
const SHOW_MONTHLY_BUDGET_KEY = '@app_show_monthly_budget';
const SHOW_YEARLY_BUDGET_KEY = '@app_show_yearly_budget';

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
  const [currency, setCurrency] = useState('$');
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [yearlyBudget, setYearlyBudget] = useState(0);
  const [showMonthlyBudget, setShowMonthlyBudget] = useState(true);
  const [showYearlyBudget, setShowYearlyBudget] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  const storageKey = user ? `${EXPENSES_KEY}_${user.email}` : EXPENSES_KEY;
  const categoriesStorageKey = user ? `${CATEGORIES_KEY}_${user.email}` : CATEGORIES_KEY;
  const paymentModesStorageKey = user ? `${PAYMENT_MODES_KEY}_${user.email}` : PAYMENT_MODES_KEY;
  const currencyStorageKey = user ? `${CURRENCY_KEY}_${user.email}` : CURRENCY_KEY;
  const budgetStorageKey = user ? `${BUDGET_KEY}_${user.email}` : BUDGET_KEY;
  const showMonthlyBudgetStorageKey = user ? `${SHOW_MONTHLY_BUDGET_KEY}_${user.email}` : SHOW_MONTHLY_BUDGET_KEY;
  const showYearlyBudgetStorageKey = user ? `${SHOW_YEARLY_BUDGET_KEY}_${user.email}` : SHOW_YEARLY_BUDGET_KEY;

  const loadData = async () => {
    try {
      setIsLoading(true);
      const storedExpenses = await AsyncStorage.getItem(storageKey);
      if (storedExpenses) {
        setExpenses(JSON.parse(storedExpenses));
      }

      const storedCategories = await AsyncStorage.getItem(categoriesStorageKey);
      if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        parsed.sort((a: Category, b: Category) => a.name.localeCompare(b.name));
        setCategories(parsed);
      } else {
        setCategories([]);
      }

      const storedPaymentModes = await AsyncStorage.getItem(paymentModesStorageKey);
      if (storedPaymentModes) {
        const parsed = JSON.parse(storedPaymentModes);
        parsed.sort((a: PaymentMode, b: PaymentMode) => a.name.localeCompare(b.name));
        setPaymentModes(parsed);
      } else {
        setPaymentModes([]);
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

      const storedShowMonthly = await AsyncStorage.getItem(showMonthlyBudgetStorageKey);
      if (storedShowMonthly !== null) setShowMonthlyBudget(storedShowMonthly === 'true');

      const storedShowYearly = await AsyncStorage.getItem(showYearlyBudgetStorageKey);
      if (storedShowYearly !== null) setShowYearlyBudget(storedShowYearly === 'true');
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storageKey, categoriesStorageKey, paymentModesStorageKey, currencyStorageKey, budgetStorageKey, showMonthlyBudgetStorageKey, showYearlyBudgetStorageKey]);

  const addExpense = async (amount: number, description: string, date: Date, categoryId?: string, paymentModeId?: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      description,
      date: date.toISOString(),
      categoryId,
      paymentModeId,
    };

    const newExpenses = [newExpense, ...expenses];
    newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setExpenses(newExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(newExpenses));
  };

  const updateExpense = async (id: string, amount: number, description: string, date: Date, categoryId?: string, paymentModeId?: string) => {
    const updatedExpenses = expenses.map(exp => 
      exp.id === id 
        ? { ...exp, amount, description, date: date.toISOString(), categoryId, paymentModeId } 
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

  const bulkDeleteExpenses = async (ids: string[]) => {
    const updatedExpenses = expenses.filter(exp => !ids.includes(exp.id));
    setExpenses(updatedExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
  };

  const addCategory = async (name: string, icon: string, color: string) => {
    const newCat: Category = { id: Date.now().toString(), name, icon, color };
    const updated = [...categories, newCat].sort((a, b) => a.name.localeCompare(b.name));
    setCategories(updated);
    await AsyncStorage.setItem(categoriesStorageKey, JSON.stringify(updated));
  };

  const updateCategory = async (id: string, name: string, icon: string, color: string) => {
    const updated = categories.map(cat => cat.id === id ? { ...cat, name, icon, color } : cat).sort((a, b) => a.name.localeCompare(b.name));
    setCategories(updated);
    await AsyncStorage.setItem(categoriesStorageKey, JSON.stringify(updated));
  };

  const deleteCategory = async (id: string) => {
    const updated = categories.filter(cat => cat.id !== id);
    setCategories(updated);
    await AsyncStorage.setItem(categoriesStorageKey, JSON.stringify(updated));
  };

  const addPaymentMode = async (name: string, icon: string, color: string) => {
    const newMode: PaymentMode = { id: Date.now().toString(), name, icon, color };
    const updated = [...paymentModes, newMode].sort((a, b) => a.name.localeCompare(b.name));
    setPaymentModes(updated);
    await AsyncStorage.setItem(paymentModesStorageKey, JSON.stringify(updated));
  };

  const updatePaymentMode = async (id: string, name: string, icon: string, color: string) => {
    const updated = paymentModes.map(mode => mode.id === id ? { ...mode, name, icon, color } : mode).sort((a, b) => a.name.localeCompare(b.name));
    setPaymentModes(updated);
    await AsyncStorage.setItem(paymentModesStorageKey, JSON.stringify(updated));
  };

  const deletePaymentMode = async (id: string) => {
    const updated = paymentModes.filter(mode => mode.id !== id);
    setPaymentModes(updated);
    await AsyncStorage.setItem(paymentModesStorageKey, JSON.stringify(updated));
  };

  const bulkImport = async (newExpenses: Expense[], newCategories: Category[], newPaymentModes: PaymentMode[]) => {
    // Merge categories
    const mergedCategories = [...categories];
    for (const cat of newCategories) {
      if (!mergedCategories.some(c => c.name.toLowerCase() === cat.name.toLowerCase())) {
        mergedCategories.push(cat);
      }
    }
    mergedCategories.sort((a, b) => a.name.localeCompare(b.name));
    setCategories(mergedCategories);
    await AsyncStorage.setItem(categoriesStorageKey, JSON.stringify(mergedCategories));

    // Merge payment modes
    const mergedPaymentModes = [...paymentModes];
    for (const mode of newPaymentModes) {
      if (!mergedPaymentModes.some(m => m.name.toLowerCase() === mode.name.toLowerCase())) {
        mergedPaymentModes.push(mode);
      }
    }
    mergedPaymentModes.sort((a, b) => a.name.localeCompare(b.name));
    setPaymentModes(mergedPaymentModes);
    await AsyncStorage.setItem(paymentModesStorageKey, JSON.stringify(mergedPaymentModes));

    // Merge expenses
    const mergedExpenses = [...expenses];
    for (const newExp of newExpenses) {
      const newExpDateStr = new Date(newExp.date).toDateString();
      const existingIndex = mergedExpenses.findIndex(e => 
        new Date(e.date).toDateString() === newExpDateStr &&
        e.amount === newExp.amount &&
        e.categoryId === newExp.categoryId &&
        e.paymentModeId === newExp.paymentModeId &&
        e.description.trim().toLowerCase() === newExp.description.trim().toLowerCase()
      );

      if (existingIndex !== -1) {
        // Update existing record
        mergedExpenses[existingIndex] = { ...mergedExpenses[existingIndex], description: newExp.description };
      } else {
        // Add new record
        mergedExpenses.push(newExp);
      }
    }

    mergedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setExpenses(mergedExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(mergedExpenses));
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

  const toggleShowMonthlyBudget = async (val: boolean) => {
    setShowMonthlyBudget(val);
    await AsyncStorage.setItem(showMonthlyBudgetStorageKey, val.toString());
  };

  const toggleShowYearlyBudget = async (val: boolean) => {
    setShowYearlyBudget(val);
    await AsyncStorage.setItem(showYearlyBudgetStorageKey, val.toString());
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
      expenses, categories, paymentModes, currency, monthlyBudget, yearlyBudget, 
      showMonthlyBudget, showYearlyBudget,
      addExpense, updateExpense, deleteExpense, bulkDeleteExpenses,
      addCategory, updateCategory, deleteCategory,
      addPaymentMode, updatePaymentMode, deletePaymentMode,
      bulkImport,
      updateCurrency, updateBudgets, toggleShowMonthlyBudget, toggleShowYearlyBudget, 
      getCurrentMonthTotal, getPreviousMonthTotal, 
      refreshExpenseData: loadData, isLoading 
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
