"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileSpreadsheet, Users, LayoutDashboard, Car, BadgeDollarSign, Settings, LogOut, User as UserIcon, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const menuItems = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Distribütör Teklif & Fatura', href: '/reports/distributor', icon: FileSpreadsheet },
    { name: 'Satış Danışmanı Raporu', href: '/reports/consultant', icon: Users },
    { name: 'Prim Raporu', href: '/reports/commission', icon: BadgeDollarSign },
  ];

  const netsisNav = [
    { name: 'Sıfır Araç Satışları', href: '/reports/netsis/new-vehicles', icon: FileSpreadsheet },
  ];

  const adminNav = [
    { name: 'Aylık Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-full bg-[#0A0F1C] border-r border-gray-800 flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 text-blue-400 mb-8">
          <Car className="w-8 h-8" />
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            DealerSales
          </h2>
        </div>
        
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Satış Raporları
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                    : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Netsis Raporları
          </p>
          <div className="space-y-1">
            {netsisNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20' 
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Yönetim
          </p>
          <div className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                      : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="mt-auto border-t border-gray-800">
        {user && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-200">{user.username}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{user.role}</span>
              </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                title="Şifre Değiştir"
              >
                <KeyRound className="w-4 h-4" />
              </button>
              <button 
                onClick={logout}
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <ChangePasswordModal 
          isOpen={isPasswordModalOpen} 
          onClose={() => setIsPasswordModalOpen(false)} 
        />
        <div className="p-4 pt-2 text-xs text-gray-600 text-center">
          &copy; 2026 Alpata Teknoloji
        </div>
      </div>
    </div>
  );
}
