"use client";

import React from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginScreen from './LoginScreen';
import Sidebar from './Sidebar';

function AuthContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050812]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </>
  );
}

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthContent>
        {children}
      </AuthContent>
    </AuthProvider>
  );
}
