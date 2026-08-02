import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { CustomerRow } from "../compoment/customer";
import { Search } from "lucide-react";

export const CustomerList = () => {
  const { orders } = useAdmin();
  const [search, setSearch] = useState("");

  // Deduplicate users/customers from orders list
  const uniqueCustomers = [];
  const emailsSeen = new Set();

  orders.forEach((o) => {
    if (!emailsSeen.has(o.email)) {
      emailsSeen.add(o.email);
      uniqueCustomers.push({
        customer: o.customer,
        email: o.email,
      });
    }
  });

  const filteredCustomers = uniqueCustomers.filter(
    (c) =>
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Customer Directory" breadcrumbs={[{ label: "Customers" }]} />

      <div className="card">
        {/* Search */}
        <div className="filter-bar">
          <div style={{ position: "relative", width: "100%", maxWidth: "360px" }}>
            <input
              type="text"
              placeholder="Search by customer name or email..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: "40px" }}
            />
            <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email Address</th>
                <th>Loyalty Tier</th>
                <th>Total Purchases</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c, idx) => (
                <CustomerRow key={c.email} customer={c} idx={idx} />
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "30px", color: "var(--text-secondary)" }}>
                    No customer accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
