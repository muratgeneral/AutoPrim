import { LayoutDashboard } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20 mb-8">
        <LayoutDashboard className="w-16 h-16 text-blue-400" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-4 tracking-tight">
        Bayi Performans <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Merkezi</span>
      </h1>
      <p className="text-gray-400 max-w-xl text-lg mb-8">
        Hoş geldiniz. Sol menüdeki "Satış Raporları" altından görüntülemek istediğiniz rapor türünü seçerek analizlere başlayabilirsiniz.
      </p>
    </div>
  );
}
