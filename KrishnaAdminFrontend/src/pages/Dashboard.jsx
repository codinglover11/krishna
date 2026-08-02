import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../stores/authStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { BarChart, LineChart, DonutChart } from '../components/common/ChartComponents';
import {
  ShoppingBag,
  FolderTree,
  Users,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  XCircle,
  Clock,
  PlusCircle,
  Tag,
  Ticket,
  TrendingUp,
  Star,
  CheckCircle2,
  Package,
  Shield,
  ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const { adminUser } = useAuthStore();
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ovData, chartData] = await Promise.all([
        adminService.getDashboardOverview(),
        adminService.getDashboardCharts()
      ]);
      setOverview(ovData);
      setCharts(chartData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Compiling PostgreSQL Business Analytics..." />;
  }

  const prod = overview?.products || {};
  const cat = overview?.categories || {};
  const cust = overview?.customers || {};
  const ord = overview?.orders || {};
  const rev = overview?.revenue || {};
  const alerts = overview?.alerts || {};

  const recentOrders = overview?.recentOrders || [];
  const recentCustomers = overview?.recentCustomers || [];
  const recentProducts = overview?.recentProducts || [];
  const recentReviews = overview?.recentReviews || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Welcome Header */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'hsl(215, 80%, 20%)', margin: '0 0 6px' }}>
            Executive Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>
            Real-time business insights compiled directly from PostgreSQL database
          </p>
        </div>
        <div style={{
          padding: '10px 18px',
          borderRadius: '8px',
          backgroundColor: 'rgba(235, 94, 85, 0.1)',
          color: 'hsl(30, 90%, 55%)',
          fontWeight: '700',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Shield size={18} /> Administrator: {adminUser?.name || 'Admin'}
        </div>
      </div>

      {/* Alerts Section */}
      {(alerts.pending_orders_count > 0 || alerts.low_stock_count > 0 || alerts.out_of_stock_count > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {alerts.pending_orders_count > 0 && (
            <div style={{ padding: '16px 20px', backgroundColor: '#fffbe finished', backgroundColor: '#fef3c7', borderRadius: '10px', border: '1px solid #fcd34d', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#d97706" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{alerts.pending_orders_count} Pending Orders</strong>
                  <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Requires admin fulfillment review</span>
                </div>
              </div>
              <Link to="/orders" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#92400e', textDecoration: 'none' }}>View →</Link>
            </div>
          )}

          {alerts.low_stock_count > 0 && (
            <div style={{ padding: '16px 20px', backgroundColor: '#fff7ed', borderRadius: '10px', border: '1px solid #ffedd5', color: '#c2410c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="#ea580c" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{alerts.low_stock_count} Low Stock Products</strong>
                  <span style={{ fontSize: '0.75rem', color: '#9a3412' }}>Variant inventory quantity ≤ 5 units</span>
                </div>
              </div>
              <Link to="/inventory" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c2410c', textDecoration: 'none' }}>Manage →</Link>
            </div>
          )}

          {alerts.out_of_stock_count > 0 && (
            <div style={{ padding: '16px 20px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <XCircle size={20} color="#ef4444" />
                <div>
                  <strong style={{ display: 'block', fontSize: '0.875rem' }}>{alerts.out_of_stock_count} Out of Stock Products</strong>
                  <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>0 inventory units remaining</span>
                </div>
              </div>
              <Link to="/inventory" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b91c1c', textDecoration: 'none' }}>Manage →</Link>
            </div>
          )}
        </div>
      )}

      {/* Overview Metric Cards Grid (14 Metrics) */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Key Business Performance Indicators</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {/* Revenue Group */}
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Total Revenue</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#10b981', margin: '6px 0 0' }}>${parseFloat(rev.total_revenue || 0).toFixed(2)}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Monthly Revenue</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#10b981', margin: '6px 0 0' }}>${parseFloat(rev.monthly_revenue || 0).toFixed(2)}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Today's Revenue</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#10b981', margin: '6px 0 0' }}>${parseFloat(rev.today_revenue || 0).toFixed(2)}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Average Order Value</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#2563eb', margin: '6px 0 0' }}>${parseFloat(rev.avg_order_value || 0).toFixed(2)}</h2>
          </div>

          {/* Orders Group */}
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Total Orders</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0f172a', margin: '6px 0 0' }}>{ord.total_orders || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#d97706' }}>Pending Orders</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#d97706', margin: '6px 0 0' }}>{ord.pending_orders || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#10b981' }}>Delivered Orders</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#10b981', margin: '6px 0 0' }}>{ord.delivered_orders || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#ef4444' }}>Cancelled Orders</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#ef4444', margin: '6px 0 0' }}>{ord.cancelled_orders || 0}</h2>
          </div>

          {/* Catalog & User Group */}
          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Total Products</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0f172a', margin: '6px 0 0' }}>{prod.total_products || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#10b981' }}>Active Products</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#10b981', margin: '6px 0 0' }}>{prod.active_products || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#f59e0b' }}>Low Stock (≤5)</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#f59e0b', margin: '6px 0 0' }}>{prod.low_stock_products || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#ef4444' }}>Out of Stock</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#ef4444', margin: '6px 0 0' }}>{prod.out_of_stock_products || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Total Categories</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#0f172a', margin: '6px 0 0' }}>{cat.total_categories || 0}</h2>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b' }}>Total Customers</span>
            <h2 style={{ fontSize: '1.625rem', fontWeight: '800', color: '#2563eb', margin: '6px 0 0' }}>{cust.total_customers || 0}</h2>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcut Cards */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Quick Administrative Shortcuts</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <Link to="/products/add" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <PlusCircle size={24} color="#2563eb" />
            <strong style={{ fontSize: '0.875rem' }}>Add Product</strong>
          </Link>

          <Link to="/categories" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <FolderTree size={24} color="#10b981" />
            <strong style={{ fontSize: '0.875rem' }}>Add Category</strong>
          </Link>

          <Link to="/orders" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <ShoppingCart size={24} color="#f59e0b" />
            <strong style={{ fontSize: '0.875rem' }}>View Orders</strong>
          </Link>

          <Link to="/customers" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <Users size={24} color="#8b5cf6" />
            <strong style={{ fontSize: '0.875rem' }}>View Customers</strong>
          </Link>

          <Link to="/offers" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <Tag size={24} color="#ec4899" />
            <strong style={{ fontSize: '0.875rem' }}>Manage Offers</strong>
          </Link>

          <Link to="/coupons" style={{ padding: '16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <Ticket size={24} color="#06b6d4" />
            <strong style={{ fontSize: '0.875rem' }}>Manage Coupons</strong>
          </Link>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Business Trends & Distributions</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          
          {/* Monthly Revenue Bar Chart */}
          <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <BarChart
              title="Monthly Revenue Trend ($)"
              data={charts?.monthlySales || []}
              xKey="month_label"
              yKey="revenue"
              color="#2563eb"
              formatValue={(v) => `$${v.toFixed(0)}`}
            />
          </div>

          {/* Orders by Month Line Chart */}
          <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <LineChart
              title="Orders Volume Trend"
              data={charts?.monthlySales || []}
              xKey="month_label"
              yKey="total_orders"
              color="#10b981"
              formatValue={(v) => `${v} orders`}
            />
          </div>

          {/* Product Category Distribution */}
          <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <DonutChart
              title="Product Distribution by Category"
              data={charts?.categoryDistribution || []}
              labelKey="category_name"
              valueKey="product_count"
              formatValue={(v) => `${v} items`}
            />
          </div>

          {/* Order Status Distribution */}
          <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <DonutChart
              title="Order Status Breakdown"
              data={charts?.orderStatusDistribution || []}
              labelKey="status"
              valueKey="order_count"
              formatValue={(v) => `${v} orders`}
            />
          </div>

        </div>
      </div>

      {/* Recent Data Listings Grid (4 Feeds) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* 1. Recent Orders Feed */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Recent Orders</h4>
            <Link to="/orders" style={{ fontSize: '0.8125rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>View All →</Link>
          </div>

          {recentOrders.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentOrders.map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a' }}>{o.order_number || o.id.slice(0, 8)}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{o.customer_name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>${parseFloat(o.total_price).toFixed(2)}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: o.status === 'Delivered' ? '#10b981' : '#d97706' }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Recent Customers Feed */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Recently Registered Customers</h4>
            <Link to="/customers" style={{ fontSize: '0.8125rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>View All →</Link>
          </div>

          {recentCustomers.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No customers registered yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentCustomers.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a' }}>{c.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Recently Added Products Feed */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Recently Added Products</h4>
            <Link to="/products" style={{ fontSize: '0.8125rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>View All →</Link>
          </div>

          {recentProducts.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No products added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentProducts.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: '#e2e8f0', overflow: 'hidden', flexShrink: 0 }}>
                      {p.primary_image ? <img src={p.primary_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} color="#94a3b8" />}
                    </div>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.875rem', color: '#0f172a' }}>{p.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.category_name || 'Uncategorized'}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', color: '#0f172a' }}>${parseFloat(p.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Latest Customer Reviews Feed */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Latest Product Reviews</h4>
            <Link to="/reviews" style={{ fontSize: '0.8125rem', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>View All →</Link>
          </div>

          {recentReviews.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No customer reviews posted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentReviews.map((r) => (
                <div key={r.id} style={{ padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <strong style={{ color: '#0f172a' }}>{r.customer_name}</strong>
                    <div style={{ color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <Star size={12} fill="#f59e0b" /> {r.rating}/5
                    </div>
                  </div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>on {r.product_name}</span>
                  {r.comment && <p style={{ margin: '4px 0 0', color: '#334155', fontStyle: 'italic' }}>"{r.comment}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
