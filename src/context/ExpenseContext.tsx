import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthContext } from './AuthContext';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string; // ISO string
}

interface ExpenseContextType {
  expenses: Expense[];
  currency: string;
  monthlyBudget: number;
  yearlyBudget: number;
  addExpense: (amount: number, description: string, date: Date) => Promise<void>;
  updateExpense: (id: string, amount: number, description: string, date: Date) => Promise<void>;
  updateCurrency: (newCurrency: string) => Promise<void>;
  updateBudgets: (monthly: number, yearly: number) => Promise<void>;
  getCurrentMonthTotal: () => number;
  isLoading: boolean;
}

const ExpenseContext = createContext<ExpenseContextType>({
  expenses: [],
  currency: '$',
  monthlyBudget: 0,
  yearlyBudget: 0,
  addExpense: async () => {},
  updateExpense: async () => {},
  updateCurrency: async () => {},
  updateBudgets: async () => {},
  getCurrentMonthTotal: () => 0,
  isLoading: true,
});

export const useExpenseContext = () => useContext(ExpenseContext);

const EXPENSES_KEY = '@app_expenses';
const CURRENCY_KEY = '@app_currency';
const BUDGET_KEY = '@app_budgets';

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currency, setCurrency] = useState('$');
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [yearlyBudget, setYearlyBudget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthContext();

  const storageKey = user ? `${EXPENSES_KEY}_${user.email}` : EXPENSES_KEY;
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

  const addExpense = async (amount: number, description: string, date: Date) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount,
      description,
      date: date.toISOString(),
    };

    const newExpenses = [newExpense, ...expenses];
    newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setExpenses(newExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(newExpenses));
  };

  const updateExpense = async (id: string, amount: number, description: string, date: Date) => {
    const updatedExpenses = expenses.map(exp => 
      exp.id === id 
        ? { ...exp, amount, description, date: date.toISOString() } 
        : exp
    );
    
    // Sort by date descending in case the date was changed
    updatedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setExpenses(updatedExpenses);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExpenses));
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

  return (
    <ExpenseContext.Provider value={{ expenses, currency, monthlyBudget, yearlyBudget, addExpense, updateExpense, updateCurrency, updateBudgets, getCurrentMonthTotal, isLoading }}>
      {children}
    </ExpenseContext.Provider>
  );
};
