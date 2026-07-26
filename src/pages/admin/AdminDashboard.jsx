import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";
import AdminLayout from './AdminLayout';
import StatCard from '../../components/ui/StatCard';
import DashboardPageHeader from '../../components/ui/DashboardPageHeader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {

  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/admin/analytics');
      setAnalyticsData(res.data?.analytics || res.data || {});
    } catch (err) {
      console.error('Analytics error:', err);
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashboardRes, categoriesRes] = await Promise.all([
          API.get('/admin/dashboard'),
          API.get('/categories')
        ]);

        const statsData =
          dashboardRes.data?.stats ||
          dashboardRes.data?.data?.stats ||
          {};

        setStats(statsData);

        const catData = categoriesRes.data?.categories || [];
        setCategories(catData.filter(c => !c.parentId));

        await fetchAnalytics();

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    { label: 'Total Users', val: stats.users ?? 0, icon: 'fa-users', tint: 'blue', link: '/admin/users' },
    { label: 'Partners', val: stats.partners ?? 0, icon: 'fa-handshake', tint: 'orange', link: '/admin/partners' },
    { label: 'Categories', val: categories.length ?? 0, icon: 'fa-th-large', tint: 'warning', link: '/admin/categories/all' },
  ];

  const analyticsCards = [
    { label: 'Total Revenue', val: `₹${analyticsData.totalRevenue || 0}`, icon: 'fa-indian-rupee-sign', tint: 'success' },
    { label: 'Today Revenue', val: `₹${analyticsData.todayRevenue || 0}`, icon: 'fa-wallet', tint: 'blue' },
    { label: 'Monthly Revenue', val: `₹${analyticsData.monthlyRevenue || 0}`, icon: 'fa-chart-line', tint: 'violet' },
    { label: 'Pending Payments', val: analyticsData.pendingPayments || 0, icon: 'fa-clock', tint: 'danger' },
  ];

  const gatewayMap = Object.fromEntries(
    (analyticsData?.gatewayAnalytics ?? []).map(g => [g._id, g.total])
  );

  const chartData = {
    labels: ["Razorpay", "PayPal"],
    datasets: [
      {
        label: "Revenue",
        data: [
          gatewayMap["razorpay"] || 0,
          gatewayMap["paypal"] || 0,
        ],
        backgroundColor: ["#1075be", "#f46f26"],
        borderRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { font: { family: 'Lato' } } },
    },
    scales: {
      x: { grid: { color: '#e2e8f0' }, ticks: { font: { family: 'Lato' } } },
      y: { grid: { color: '#e2e8f0' }, ticks: { font: { family: 'Lato' } } },
    },
  };

  return (
    <AdminLayout>
      <DashboardPageHeader title="Admin Dashboard" />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {analyticsCards.map(card => (
              <div key={card.label} className="col-xl-3 col-md-4 col-sm-6">
                <StatCard icon={card.icon} tint={card.tint} value={card.val} label={card.label} />
              </div>
            ))}
          </div>

          <div className="row g-3 mb-4">
            {cards.map(c => (
              <div key={c.label} className="col-xl-3 col-md-4 col-sm-6">
                <Link to={c.link} className="text-decoration-none">
                  <StatCard icon={c.icon} tint={c.tint} value={c.val} label={c.label} />
                </Link>
              </div>
            ))}
          </div>

          <div className="cw-card">
            <h2 className="h6 fw-bold mb-3">Payment Gateway Comparison</h2>
            <Bar data={chartData} options={options} />
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
