import React, { useState } from "react";
import { useAdmin } from "../hooks/useAdmin";
import { PageHeader } from "../compoment/common";
import { FinancialSummary, ProfitChart } from "../compoment/profit";
import { REPORT_DATA } from "../coonstants/constants";
import { formatCurrency } from "../utils/utils";
import { Download, Calendar, ArrowUpRight } from "lucide-react";

export const ReportList = () => {
  const { orders } = useAdmin();
  const [dateRange, setDateRange] = useState("30");
  const [downloading, setDownloading] = useState(false);

  const totalSalesVal = orders.reduce((sum, o) => sum + (o.status !== "Cancelled" ? o.total : 0), 0);
  const totalProfitVal = totalSalesVal * 0.38;
  const totalOrdersCompleted = orders.filter((o) => o.status === "Delivered").length;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert("Report PDF has been generated and downloaded to your downloads folder!");
    }, 1500);
  };

  return (
    <div>
      <PageHeader title="Business Reports & Analytics" breadcrumbs={[{ label: "Reports" }]}>
        <div style={{ display: "flex", gap: "10px" }}>
          <select
            className="form-control"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: "160px" }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
            <option value="365">This Year</option>
          </select>
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            <Download size={18} /> {downloading ? "Exporting..." : "Download PDF"}
          </button>
        </div>
      </PageHeader>

      {/* Numerical summary metrics grid */}
      <FinancialSummary
        totalSales={totalSalesVal}
        totalProfit={totalProfitVal}
        totalOrders={totalOrdersCompleted}
      />

      <div className="grid-layout">
        {/* Sales charts */}
        <div className="card">
          <div className="card-title">Sales Trend Growth</div>
          <ProfitChart data={REPORT_DATA.salesByMonth} />
        </div>

        {/* Top items products lists table */}
        <div className="card">
          <div className="card-title">Top Selling Footwear</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {REPORT_DATA.topProducts.map((prod, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--glass-border)"
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{prod.name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{prod.sales} quantities sold</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "var(--accent-cyan)", fontSize: "0.95rem" }}>
                    {formatCurrency(prod.revenue)}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "2px", color: "var(--accent-green)", fontSize: "0.75rem", justifyContent: "flex-end" }}>
                    <ArrowUpRight size={10} />
                    <span>Top Product</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportList;
