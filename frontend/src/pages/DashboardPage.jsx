import DashboardLayout from '../components/Shared/DashboardLayout';
import Overview from '../components/Dashboard/Overview';
import DashboardScene from '../components/Three/DashboardScene';
import useAuth from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout scene={<DashboardScene />}>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
          {greeting}{user?.first_name ? `, ${user.first_name}` : ''}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Here's what's happening across your accounts
        </p>
      </div>
      <Overview />
    </DashboardLayout>
  );
};

export default DashboardPage;
