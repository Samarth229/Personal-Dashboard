import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../components/Shared/DashboardLayout';
import DataSources from '../components/Settings/DataSources';
import Profile from '../components/Settings/Profile';
import ApiKeys from '../components/Settings/ApiKeys';

const tabs = [
  { id: 'sources', label: 'Data Sources' },
  { id: 'apikeys', label: 'API Keys' },
  { id: 'profile', label: 'Profile' },
];

const ALL_QUERY_KEYS = ['data-sources', 'overview', 'github', 'spotify', 'gmail', 'fitness', 'letterboxd', 'steam', 'riot', 'config-status'];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('sources');
  const [searchParams, setSearchParams] = useSearchParams();
  const [banner, setBanner] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      setBanner(connected);
      ALL_QUERY_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      setSearchParams({}, { replace: true });
      setTimeout(() => setBanner(null), 5000);
    }
  }, []);

  return (
    <DashboardLayout>
      {banner && (
        <div className="mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.2)' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: '#34c759' }}>
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium capitalize" style={{ color: '#1a7f37' }}>
            {banner} connected — syncing your data now
          </p>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: 'rgba(255,255,255,0.92)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Manage your connected services and profile</p>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-full w-fit" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={activeTab === tab.id
              ? { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
              : { color: 'rgba(255,255,255,0.45)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sources' && <DataSources />}
      {activeTab === 'apikeys' && <ApiKeys />}
      {activeTab === 'profile' && <Profile />}
    </DashboardLayout>
  );
};

export default SettingsPage;
