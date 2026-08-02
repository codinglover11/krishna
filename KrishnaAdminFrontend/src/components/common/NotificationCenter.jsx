import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { toast } from '../../stores/toastStore';
import { Bell, Check, CheckCheck, Trash2, X, AlertCircle, ShoppingBag, Info } from 'lucide-react';

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getNotifications();
      setNotifications(data?.notifications || []);
      setUnreadCount(data?.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling update every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await adminService.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminService.markAllNotificationsRead();
      toast.success('All notifications marked as read.');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark all read.');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await adminService.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to delete notification.');
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="Notifications"
      >
        <Bell size={20} color="#334155" />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '0.6875rem',
            fontWeight: '800',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 2px #fff'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '46px',
          width: '360px',
          maxHeight: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: '800', color: '#0f172a' }}>Notifications</h4>
              {unreadCount > 0 && (
                <span style={{ fontSize: '0.75rem', backgroundColor: '#dbeafe', color: '#2563eb', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          {/* List Content */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: notif.is_read ? '#ffffff' : '#f0f9ff',
                    border: '1px solid',
                    borderColor: notif.is_read ? '#f1f5f9' : '#bae6fd',
                    marginBottom: '6px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {notif.type === 'order' ? <ShoppingBag size={18} color="#2563eb" /> : <Info size={18} color="#64748b" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '0.8125rem', color: '#0f172a' }}>{notif.title}</strong>
                    <p style={{ margin: '2px 0 4px', fontSize: '0.75rem', color: '#475569' }}>{notif.message}</p>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    {!notif.is_read && (
                      <button onClick={(e) => handleMarkRead(notif.id, e)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }} title="Mark Read">
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={(e) => handleDelete(notif.id, e)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default NotificationCenter;
