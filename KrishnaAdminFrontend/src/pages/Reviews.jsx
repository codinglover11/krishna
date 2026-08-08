import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { toast } from '../stores/toastStore';
import { DataTable } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Star, CheckCircle, XCircle, Trash2, Eye, Search, Filter } from 'lucide-react';

export const Reviews = () => {
  const [reviewsData, setReviewsData] = useState({ reviews: [], pagination: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchReviews = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminReviews({
        page,
        limit: 10,
        search,
        status: statusFilter,
        rating: ratingFilter
      });
      setReviewsData(data || { reviews: [], pagination: {} });
    } catch (err) {
      toast.error('Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
  }, [statusFilter, ratingFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReviews(1);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminService.updateReviewStatus(id, newStatus);
      toast.success(`Review status updated to ${newStatus}`);
      fetchReviews(reviewsData.pagination.currentPage || 1);
    } catch (err) {
      toast.error('Failed to update review status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer review?')) return;
    try {
      await adminService.deleteReview(id);
      toast.success('Review soft-deleted.');
      fetchReviews(reviewsData.pagination.currentPage || 1);
    } catch (err) {
      toast.error('Delete failed.');
    }
  };

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'product_name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--ink)' }}>{row.product_name}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>SKU: {row.product_sku}</span>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: 'customer_name',
      render: (row) => (
        <div>
          <strong style={{ display: 'block', color: 'var(--ink)' }}>{row.customer_name}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)' }}>{row.customer_email}</span>
        </div>
      )
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--chestnut)', fontWeight: '700' }}>
          <Star size={16} fill="var(--chestnut)" />
          <span>{row.rating}/5</span>
        </div>
      )
    },
    {
      header: 'Comment',
      accessor: 'comment',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: 'var(--ink-soft)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '300px' }}>
          "{row.comment}"
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span style={{
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '700',
          backgroundColor: row.status === 'Approved' ? 'rgba(46, 70, 53, 0.1)' : row.status === 'Rejected' ? 'rgba(185, 122, 102, 0.1)' : 'var(--parchment-soft)',
          color: row.status === 'Approved' ? 'var(--bottle)' : row.status === 'Rejected' ? 'var(--rose)' : 'var(--chestnut)'
        }}>
          {row.status || 'Pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => handleViewDetail(row)} style={{ padding: '6px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer' }} title="View Detail">
            <Eye size={16} color="var(--brass)" />
          </button>
          
          {row.status !== 'Approved' && (
            <button onClick={() => handleUpdateStatus(row.id, 'Approved')} style={{ padding: '6px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer' }} title="Approve Review">
              <CheckCircle size={16} color="var(--bottle)" />
            </button>
          )}

          {row.status !== 'Rejected' && (
            <button onClick={() => handleUpdateStatus(row.id, 'Rejected')} style={{ padding: '6px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer' }} title="Reject Review">
              <XCircle size={16} color="var(--chestnut)" />
            </button>
          )}

          <button onClick={() => handleDelete(row.id)} style={{ padding: '6px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--card)', cursor: 'pointer' }} title="Delete">
            <Trash2 size={16} color="var(--rose)" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--ink)', margin: 0, fontFamily: '"Rozha One", serif' }}>Review Management</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '0.875rem', margin: '4px 0 0' }}>Approve, reject, or delete customer product ratings and reviews</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ padding: '16px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, display: 'flex', gap: '8px', minWidth: '260px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, product, or review comment..."
              style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Reviews Data Table */}
      <div style={{ padding: '24px', backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--line)' }}>
        <DataTable
          columns={columns}
          data={reviewsData.reviews || []}
          isLoading={isLoading}
          emptyMessage="No customer reviews found."
        />
      </div>

      {/* Review Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Review Details">
        {selectedReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--chestnut)', fontSize: '1.125rem', fontWeight: '800' }}>
                <Star size={20} fill="var(--chestnut)" /> {selectedReview.rating}/5 Stars
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                backgroundColor: selectedReview.status === 'Approved' ? 'rgba(46, 70, 53, 0.1)' : 'rgba(185, 122, 102, 0.1)',
                color: selectedReview.status === 'Approved' ? 'var(--bottle)' : 'var(--rose)'
              }}>
                {selectedReview.status}
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--parchment-soft)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', fontSize: '0.875rem' }}>
              <div><strong style={{ color: 'var(--ink)' }}>Product:</strong> {selectedReview.product_name} ({selectedReview.product_sku})</div>
              <div><strong style={{ color: 'var(--ink)' }}>Customer Name:</strong> {selectedReview.customer_name}</div>
              <div><strong style={{ color: 'var(--ink)' }}>Customer Email:</strong> {selectedReview.customer_email}</div>
              <div><strong style={{ color: 'var(--ink)' }}>Posted Date:</strong> {new Date(selectedReview.created_at).toLocaleString()}</div>
            </div>

            <div>
              <strong style={{ display: 'block', fontSize: '0.875rem', color: 'var(--ink)', marginBottom: '6px' }}>Customer Feedback Comment:</strong>
              <p style={{ margin: 0, padding: '12px', backgroundColor: 'var(--parchment-soft)', borderRadius: '6px', fontStyle: 'italic', fontSize: '0.9375rem', color: 'var(--ink-soft)' }}>
                "{selectedReview.comment}"
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              {selectedReview.status !== 'Approved' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedReview.id, 'Approved');
                    setIsDetailModalOpen(false);
                  }}
                  style={{ padding: '10px 18px', backgroundColor: 'var(--bottle)', color: 'var(--parchment)', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Approve Review
                </button>
              )}

              {selectedReview.status !== 'Rejected' && (
                <button
                  onClick={() => {
                    handleUpdateStatus(selectedReview.id, 'Rejected');
                    setIsDetailModalOpen(false);
                  }}
                  style={{ padding: '10px 18px', backgroundColor: 'var(--rose)', color: 'var(--parchment)', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Reject Review
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Reviews;
