"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileSpreadsheet, Users, LayoutDashboard, Car, BadgeDollarSign, Settings } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Ana Sayfa', href: '/', icon: Home },
    { name: 'Distribütör Teklif & Fatura', href: '/reports/distributor', icon: FileSpreadsheet },
    { name: 'Satış Danışmanı Raporu', href: '/reports/consultant', icon: Users },
    { name: 'Prim Raporu', href: '/reports/commission', icon: BadgeDollarSign },
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
      
      <div className="mt-auto p-6 text-xs text-gray-600">
        &copy; 2026 Alpata Teknoloji
      </div>
    </div>
  );
}
