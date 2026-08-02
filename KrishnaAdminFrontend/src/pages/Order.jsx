import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { OrderRow, OrderInvoice } from "../compoment/order";
import { Modal } from "../compoment/ui";
import { Search } from "lucide-react";

export const OrderList = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div>
      <PageHeader title="Customer Orders Ledger" breadcrumbs={[{ label: "Orders" }]} />

      <div className="card">
        {/* Filters and search */}
        <div className="filter-bar">
          <div className="filter-group" style={{ flex: 1, minWidth: "260px" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
              <input
                type="text"
                placeholder="Search by customer name or order ID..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "40px" }}
              />
              <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
            </div>

            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "160px" }}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Details</th>
                <th>Date Placed</th>
                <th>Order Total</th>
                <th>Order Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onViewDetails={handleViewDetails}
                  onStatusUpdate={handleStatusChange}
                />
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    No orders matching selected criteria found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Purchase Bill Summary - ${selectedOrder?.id}`}>
        <OrderInvoice order={selectedOrder} />
      </Modal>
    </div>
  );
};

export default OrderList;
