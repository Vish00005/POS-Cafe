import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import { Users, QrCode, Plus, CheckCircle, XCircle, RefreshCw, X, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const FloorView = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState('all');
  const [qrModal, setQrModal] = useState(null);
  const navigate = useNavigate();

  const fetchTables = () => {
    api.get('/api/v1/table')
      .then(({ data }) => setTables(data))
      .catch(() => toast.error('Failed to load tables'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTables();
    const iv = setInterval(fetchTables, 10000); // auto-refresh
    return () => clearInterval(iv);
  }, []);

  const setAvailable = async (t) => {
    try {
      await api.put(`/api/v1/table/${t._id}/status`, { isOccupied: false });
      toast.success(`Table ${t.tableNumber} marked available`);
      fetchTables();
    } catch {
      toast.error('Failed to update table');
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied!');
  };

  const floors = [...new Set(tables.map(t => t.floor).filter(Boolean))].sort();

  const displayed = activeFloor === 'all'
    ? tables
    : tables.filter(t => t.floor === parseInt(activeFloor));

  const groupedByFloor = floors.reduce((acc, f) => {
    const ft = displayed.filter(t => t.floor === f);
    if (ft.length) acc[f] = ft;
    return acc;
  }, {});

  const occupied = tables.filter(t => t.isOccupied).length;
  const available = tables.filter(t => !t.isOccupied).length;

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-5 slide-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Floor View</h1>
            <p className="text-slate-400 text-sm">
              <span className="text-green-400 font-medium">{available} free</span>
              {' · '}
              <span className="text-red-400 font-medium">{occupied} occupied</span>
              {' · '}
              {tables.length} total
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchTables} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => navigate('/pos/order')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              <Plus size={16} /> New Order
            </button>
          </div>
        </div>

        {/* Floor tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveFloor('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeFloor === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            All Floors
          </button>
          {floors.map(f => (
            <button
              key={f}
              onClick={() => setActiveFloor(String(f))}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeFloor === String(f) ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Floor {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByFloor).map(([floor, fTables]) => (
              <div key={floor}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">
                  Floor {floor} — {fTables.filter(t => !t.isOccupied).length} free / {fTables.length} tables
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {fTables.map((t) => {
                    const isOcc = t.isOccupied;
                    return (
                      <div
                        key={t._id}
                        className={`glass rounded-2xl p-4 border-2 flex flex-col items-center gap-3 transition-all group ${
                          isOcc
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-green-500/30 bg-green-500/5 hover:border-green-400/60'
                        }`}
                      >
                        {/* Table icon */}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg transition-transform group-hover:scale-105 ${
                          isOcc ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                        }`}>
                          {t.tableNumber}
                        </div>

                        {/* Status badge */}
                        <div className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                          isOcc ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {isOcc ? <XCircle size={10} /> : <CheckCircle size={10} />}
                          {isOcc ? 'Occupied' : 'Free'}
                        </div>

                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Users size={10} /> {t.seats} seats · Fl.{t.floor}
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-1.5 w-full">
                          <button
                            onClick={() => setQrModal(t)}
                            title="Show QR"
                            className="flex-1 flex items-center justify-center gap-1 text-xs bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white py-2 rounded-lg transition-all"
                          >
                            <QrCode size={12} /> QR
                          </button>
                          {isOcc ? (
                            <button
                              onClick={() => setAvailable(t)}
                              title="Mark as Available"
                              className="flex-1 flex items-center justify-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded-lg transition-all"
                            >
                              <CheckCircle size={12} /> Free
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/pos/order?table=${t.tableNumber}`)}
                              title="Create Order"
                              className="flex-1 flex items-center justify-center gap-1 text-xs bg-indigo-700 hover:bg-indigo-600 text-white py-2 rounded-lg transition-all"
                            >
                              <Plus size={12} /> Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Table {qrModal.tableNumber} · Floor {qrModal.floor}</h2>
              <button onClick={() => setQrModal(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex justify-center p-4 bg-white rounded-2xl">
              <QRCodeSVG value={qrModal.qrCode} size={190} level="H" />
            </div>
            <p className="text-xs text-slate-400 text-center">
              Customer scans to order for Table {qrModal.tableNumber}
            </p>
            <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-3">
              <code className="text-xs text-indigo-400 flex-1 truncate">{qrModal.qrCode}</code>
              <button onClick={() => copyLink(qrModal.qrCode)} className="text-slate-400 hover:text-white shrink-0">
                <Copy size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={qrModal.qrCode}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl text-sm font-medium transition-all"
              >
                <ExternalLink size={14} /> Open Link
              </a>
              {qrModal.isOccupied && (
                <button
                  onClick={() => { setAvailable(qrModal); setQrModal(null); }}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-sm font-medium transition-all"
                >
                  <CheckCircle size={14} /> Mark Free
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default FloorView;
