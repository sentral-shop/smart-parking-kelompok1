import { useState, useEffect } from 'react';
import { getStats, getLogs, openGate } from './api';
import { ChartBarIcon, TruckIcon, CheckBadgeIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

function App() {
  const [stats, setStats] = useState({ total: 0, didalam: 0, selesai: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gateOpeningId, setGateOpeningId] = useState(null);

  const fetchData = async () => {
    try {
      const [statsData, logsData] = await Promise.all([getStats(), getLogs()]);
      setStats(statsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Auto refresh setiap 3 detik agar real-time tanpa websocket
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleBukaGerbang = async (id) => {
    setGateOpeningId(id);
    try {
      await openGate(id);
      await fetchData();
    } catch (error) {
      alert("Gagal membuka gerbang: " + error.message);
    } finally {
      setGateOpeningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-parking-dark text-slate-200 font-sans p-6 md:p-10">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldCheckIcon className="w-10 h-10 text-parking-accent" />
            Smart Parking System
          </h1>
          <p className="text-slate-400 mt-2">Live monitoring area parkir Universitas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-parking-success animate-pulse"></div>
          <span className="text-sm font-medium text-parking-success">System Online</span>
        </div>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-parking-card border border-parking-border p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ChartBarIcon className="w-24 h-24 text-parking-accent" />
          </div>
          <h3 className="text-slate-400 font-medium mb-1">Total Kendaraan Hari Ini</h3>
          <p className="text-4xl font-bold text-white">{stats.total}</p>
        </div>
        
        <div className="bg-parking-card border border-parking-border p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TruckIcon className="w-24 h-24 text-parking-warn" />
          </div>
          <h3 className="text-slate-400 font-medium mb-1">Kendaraan Di Dalam</h3>
          <p className="text-4xl font-bold text-parking-warn">{stats.didalam}</p>
        </div>

        <div className="bg-parking-card border border-parking-border p-6 rounded-2xl shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckBadgeIcon className="w-24 h-24 text-parking-success" />
          </div>
          <h3 className="text-slate-400 font-medium mb-1">Telah Keluar</h3>
          <p className="text-4xl font-bold text-parking-success">{stats.selesai}</p>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-parking-card border border-parking-border rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-parking-border bg-slate-800/50">
          <h2 className="text-xl font-bold text-white">Log Kendaraan Terbaru</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Plat Nomor</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Waktu Masuk</th>
                <th className="px-6 py-4 font-medium">Waktu Keluar</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parking-border">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Belum ada kendaraan hari ini.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono bg-slate-900 px-3 py-1 rounded border border-slate-700 text-white font-bold tracking-wider">
                        {log.plat_nomor}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        log.status === 'Masuk' 
                          ? 'bg-parking-warn/20 text-parking-warn border border-parking-warn/30' 
                          : 'bg-parking-success/20 text-parking-success border border-parking-success/30'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(log.waktu_masuk).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {log.waktu_keluar ? new Date(log.waktu_keluar).toLocaleTimeString('id-ID') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Masuk' ? (
                        <button
                          onClick={() => handleBukaGerbang(log.id)}
                          disabled={gateOpeningId === log.id}
                          className="px-4 py-2 bg-parking-accent hover:bg-cyan-400 text-parking-dark font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {gateOpeningId === log.id ? 'Memproses...' : 'Buka Gerbang'}
                        </button>
                      ) : (
                        <span className="text-slate-500 text-sm">Selesai</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
