import React from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { ExpenseProvider } from './src/context/ExpenseContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </ExpenseProvider>
    </AuthProvider>
  );
}
