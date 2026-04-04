import { useState, useEffect } from 'react';
import api from '../../services/api';
import Layout from '../../components/Layout';
import Spinner from '../../components/Spinner';
import { QRCodeSVG } from 'qrcode.react';
import { Save, Smartphone, Store, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [settings, setSettings] = useState({ upiId: '', upiName: '', cafeName: '', currency: 'INR' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/v1/settings')
      .then(({ data }) => setSettings(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/v1/settings', settings);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const upiLink = settings.upiId
    ? `upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiName || 'Smart Cafeteria')}&cu=INR`
    : '';

  const copyUpiId = () => {
    navigator.clipboard.writeText(settings.upiId);
    toast.success('UPI ID copied!');
  };

  return (
    <Layout>
      <div className="p-6 space-y-6 slide-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-black text-white">Settings</h1>
          <p className="text-slate-400 text-sm mt-0.5">Configure your cafeteria details and payment settings</p>
        </div>

        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
          <>
            {/* Cafe Info */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Store size={18} className="text-indigo-400" /> Cafe Details
              </div>
              {[
                { label: 'Cafe Name', key: 'cafeName', placeholder: 'Smart Cafeteria' },
                { label: 'Currency', key: 'currency', placeholder: 'INR' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <input
                    value={settings[key] || ''}
                    onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            {/* UPI Settings */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Smartphone size={18} className="text-purple-400" /> UPI Payment Settings
              </div>
              <p className="text-xs text-slate-500">
                Set your UPI ID below. Customers selecting UPI payment will see a QR code generated from this ID.
                The cashier then confirms the payment manually.
              </p>

              {[
                { label: 'UPI ID (VPA)', key: 'upiId', placeholder: 'yourname@upi' },
                { label: 'Display Name on QR', key: 'upiName', placeholder: 'Smart Cafeteria' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <div className="relative">
                    <input
                      value={settings[key] || ''}
                      onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {key === 'upiId' && settings.upiId && (
                      <button onClick={copyUpiId} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                        <Copy size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Live QR preview */}
              {settings.upiId && (
                <div className="mt-3 flex items-center gap-5">
                  <div className="p-3 bg-white rounded-2xl shadow-lg">
                    <QRCodeSVG value={upiLink} size={120} level="H" />
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-white font-medium">{settings.upiName || 'Smart Cafeteria'}</div>
                    <div className="text-indigo-400 font-mono text-xs">{settings.upiId}</div>
                    <div className="text-slate-500 text-xs">This QR is shown to customers when they select UPI</div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminSettings;
