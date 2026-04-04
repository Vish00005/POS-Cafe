import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, X, Save, Wifi, Users, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const floors = [1, 2, 3];

const TablesManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [qrModal, setQrModal] = useState(null); // table object
  const [form, setForm] = useState({ tableNumber: '', seats: '', floor: '1' });
  const [saving, setSaving] = useState(false);
  const [activeFloor, setActiveFloor] = useState('all');

  const fetchTables = () => {
    api.get('/api/v1/table')
      .then(({ data }) => setTables(data))
      .catch(() => toast.error('Failed to load tables'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchTables, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/v1/table', {
        tableNumber: parseInt(form.tableNumber),
        seats: parseInt(form.seats),
        floor: parseInt(form.floor),
      });
      toast.success('Table created!');
      setModal(false);
      setForm({ tableNumber: '', seats: '', floor: '1' });
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create table');
    } finally {
      setSaving(false);
    }
  };

  const setAvailable = async (table) => {
    try {
      await api.put(`/api/v1/table/${table._id}/status`, { isOccupied: false });
      toast.success(`Table ${table.tableNumber} is now available`);
      fetchTables();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied!');
  };

  const floorTables = activeFloor === 'all'
    ? tables
    : tables.filter(t => t.floor === parseInt(activeFloor));

  const groupedByFloor = floors.reduce((acc, f) => {
    const ft = floorTables.filter(t => t.floor === f);
    if (ft.length) acc[f] = ft;
    return acc;
  }, {});

  const occupied = tables.filter(t => t.isOccupied).length;
  const available = tables.filter(t => !t.isOccupied && t.isActive).length;

  return (
    <Layout>
      <div className="p-6 space-y-5 slide-in">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Tables</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {tables.length} tables · <span className="text-green-400">{available} available</span> · <span className="text-red-400">{occupied} occupied</span>
            </p>
          </div>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus size={16} /> Add Table
          </button>
        </div>

        {/* Floor filter tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFloor('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFloor === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            All Floors
          </button>
          {floors.map(f => (
            <button
              key={f}
              onClick={() => setActiveFloor(String(f))}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFloor === String(f) ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Floor {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByFloor).map(([floor, floorTables]) => (
              <div key={floor}>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-white text-xs">{floor}</span>
                  Floor {floor}
                  <span className="text-xs text-slate-600 normal-case font-normal">({floorTables.length} tables)</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {floorTables.map((t) => (
                    <div
                      key={t._id}
                      className={`glass rounded-2xl p-4 border-2 flex flex-col gap-3 transition-all ${
                        t.isOccupied ? 'border-red-500/50 bg-red-500/5' : 'border-green-500/30 bg-green-500/5'
                      }`}
                    >
                      {/* Table number */}
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${t.isOccupied ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {t.tableNumber}
                        </div>
                        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${t.isOccupied ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {t.isOccupied ? <><XCircle size={10} /> Occupied</> : <><CheckCircle size={10} /> Free</>}
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Users size={11} /> {t.seats} seats
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          onClick={() => setQrModal(t)}
                          className="flex-1 flex items-center justify-center gap-1 text-xs bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white py-1.5 rounded-lg transition-all"
                        >
                          <QrCode size={11} /> QR
                        </button>
                        {t.isOccupied && (
                          <button
                            onClick={() => setAvailable(t)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded-lg transition-all"
                          >
                            <CheckCircle size={11} /> Free
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedByFloor).length === 0 && (
              <div className="glass rounded-2xl p-12 text-center text-slate-500">
                No tables on this floor. Add one above.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Table Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-700">
              <h2 className="text-lg font-semibold text-white">Add Table</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {[
                { label: 'Table Number', key: 'tableNumber', min: '1' },
                { label: 'Seats', key: 'seats', min: '1' },
              ].map(({ label, key, min }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
                  <input
                    type="number" required min={min}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Floor</label>
                <select
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium py-2.5 transition-all">
                  <Save size={15} />{saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Table {qrModal.tableNumber} QR</h2>
              <button onClick={() => setQrModal(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex justify-center p-4 bg-white rounded-2xl">
              <QRCodeSVG value={qrModal.qrCode} size={180} level="H" />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 text-center">Customer scans this to open the menu for Table {qrModal.tableNumber}</p>
              <div className="flex items-center gap-2 bg-slate-800 rounded-xl p-3">
                <code className="text-xs text-indigo-400 flex-1 truncate">{qrModal.qrCode}</code>
                <button onClick={() => copyLink(qrModal.qrCode)} className="text-slate-400 hover:text-white shrink-0">
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <a
              href={qrModal.qrCode}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-medium transition-all"
            >
              <ExternalLink size={15} /> Open Menu Link
            </a>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TablesManagement;
