import { useState, useEffect, useRef } from "react";
import toast from 'react-hot-toast';
import { userAPI, droneAPI, orderAPI, quotationAPI, taskAPI, serviceRequestAPI } from "@/services";

const G = {
  50: "#E8F5E9", 100: "#C8E6C9", 200: "#A5D6A7", 300: "#81C784",
  400: "#4CAF50", 500: "#388E3C", 600: "#2E7D32", 700: "#1B5E20",
  800: "#0D3B11", 900: "#051A07",
  amber: "#F59E0B", amberLight: "#FEF3C7",
  blue: "#3B82F6", blueLight: "#DBEAFE",
  red: "#EF4444", redLight: "#FEE2E2",
  purple: "#8B5CF6", purpleLight: "#EDE9FE",
  gray50: "#F9FAFB", gray100: "#F3F4F6", gray200: "#E5E7EB",
  gray400: "#9CA3AF", gray500: "#6B7280", gray600: "#4B5563",
  gray700: "#374151", gray800: "#1F2937", gray900: "#111827",
};

const css = {
  header: {
    background: "#0A3D2E",
    color: "white",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 200
  },
  nav: {
    background: "white",
    borderBottom: `1px solid ${G.gray200}`,
    overflowX: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    gap: 8
  },
  navBtn: (active) => ({
    padding: "14px 14px",
    background: "none",
    border: "none",
    color: active ? G[600] : G.gray500,
    borderBottom: active ? `3px solid ${G[600]}` : "3px solid transparent",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    transition: "color 0.2s"
  }),
  card: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    border: `1px solid ${G.gray200}`,
    marginBottom: 12
  },
  statCard: (color) => ({
    background: "white",
    borderRadius: 16,
    padding: 18,
    borderLeft: `4px solid ${color}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
  }),
  btn: (bg, color = "white") => ({
    background: bg,
    color,
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 6
  }),
  input: {
    padding: "10px 12px",
    border: `1.5px solid ${G.gray200}`,
    borderRadius: 8,
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit"
  },
  select: {
    padding: "10px 12px",
    border: `1.5px solid ${G.gray200}`,
    borderRadius: 8,
    fontSize: 14,
    background: "white",
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "inherit"
  },
  label: {
    display: "block",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: 600,
    color: G.gray700
  },
  badge: (bg, text) => ({
    background: bg,
    color: text,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center"
  }),
  modal: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1000,
    padding: "0"
  },
  modalBox: {
    background: "white",
    borderRadius: "20px 20px 0 0",
    width: "100%",
    maxWidth: 700,
    maxHeight: "92vh",
    overflowY: "auto"
  },
};

const LOGO = "https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_99,h_99,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png";

const ICONS = {
  dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  quote: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  orders: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>,
  reports: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  plus: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  x: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  truck: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>,
  check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  save: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  userplus: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>,
  file: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
  user: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  camera: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
  tool: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  drone: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 9V3M12 21v-6M9 12H3M21 12h-6" /><circle cx="5" cy="5" r="1.5" /><circle cx="19" cy="5" r="1.5" /><circle cx="5" cy="19" r="1.5" /><circle cx="19" cy="19" r="1.5" /></svg>,
};

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A";
const fmtDateTime = (d) => { if (!d) return "N/A"; const dt = new Date(d); return `${dt.toLocaleDateString("en-IN")} at ${dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`; };

const STATUS_MAP = {
  pending: { bg: G.amberLight, color: G.amber, label: "Pending" },
  approved: { bg: "#D1FAE5", color: G[600], label: "Approved" },
  rejected: { bg: G.redLight, color: G.red, label: "Rejected" },
  converted: { bg: G.purpleLight, color: G.purple, label: "Converted" },
  ORDER_CREATED: { bg: G.purpleLight, color: G.purple, label: "Created" },
  PRODUCTION_STARTED: { bg: "#FCE7F3", color: "#BE185D", label: "Production" },
  QUALITY_CHECK: { bg: "#CCFBF1", color: "#0F766E", label: "Quality" },
  READY_FOR_DISPATCH: { bg: "#FFEDD5", color: "#EA580C", label: "Ready" },
  LEFT_PRODUCTION: { bg: "#E0F2FE", color: "#0369A1", label: "Left Facility" },
  DISPATCHED: { bg: G.blueLight, color: G.blue, label: "Dispatched" },
  DELIVERED: { bg: "#D1FAE5", color: G[600], label: "Delivered" },
};

const TRACKING_STAGES = ["ORDER_CREATED", "PRODUCTION_STARTED", "QUALITY_CHECK", "READY_FOR_DISPATCH", "LEFT_PRODUCTION", "DISPATCHED", "DELIVERED"];
const STAGE_LABELS = ["Created", "Production", "Quality", "Ready", "Left", "Dispatched", "Delivered"];

const ADDON_PRICES = { extraBattery: 36500, propellerSet: 8500, carryingCase: 12500, extendedWarranty: 25000, spareParts: 15000, fastCharger: 3500 };
const ADDON_LABELS = { extraBattery: "Extra Battery Set", propellerSet: "Propeller Set (4 pcs)", carryingCase: "Carrying Case", extendedWarranty: "Extended Warranty (2yr)", spareParts: "Spare Parts Kit", fastCharger: "Fast Charger" };
const GST_RATES = [0, 5, 12, 18, 28];

function Badge({ status }) {
  const s = STATUS_MAP[status] || { bg: G.gray100, color: G.gray600, label: status };
  return <span style={{ ...css.badge(s.bg, s.color) }}>{s.label}</span>;
}

// ── GET AUTH TOKEN ──────────────────────────────────────────────────────
const getAuthToken = () => {
  let token = localStorage.getItem('token') || 
              localStorage.getItem('authToken') || 
              localStorage.getItem('jwt');
  
  if (!token) {
    console.warn('⚠️ No token found');
    return null;
  }
  return token;
};

// ── jsPDF report generator ──────────────────────────────────────────────────
function loadJsPDF(cb) {
  if (window.jspdf) { cb(); return; }
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  s.onload = cb;
  document.head.appendChild(s);
}

function generateQuotationPDF(quotation) {
  loadJsPDF(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = 210, ph = 297, ml = 15, mr = 15, contentW = pw - ml - mr;
    let y = 0;

    doc.setFillColor(13, 27, 15);
    doc.rect(0, 0, pw, 42, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("GOAG SERVICES PVT LTD", ml, 17);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 220, 160);
    doc.text("Agricultural Drone Solutions", ml, 24);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("QUOTATION", pw - mr, 17, { align: "right" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 220, 160);
    doc.text(quotation.number || "N/A", pw - mr, 24, { align: "right" });

    y = 52;
    const infoBoxW = (contentW - 6) / 3;
    [{ label: "Date", value: fmtDate(quotation.createdDate) }, { label: "Valid Until", value: fmtDate(new Date(Date.now() + 30 * 864e5)) }, { label: "Status", value: (STATUS_MAP[quotation.status] || {}).label || quotation.status }].forEach((item, i) => {
      const x = ml + i * (infoBoxW + 3);
      doc.setFillColor(232, 245, 233); doc.roundedRect(x, y, infoBoxW, 14, 2, 2, "F");
      doc.setTextColor(46, 125, 50); doc.setFontSize(7.5); doc.setFont("helvetica", "bold");
      doc.text(item.label.toUpperCase(), x + 4, y + 5.5);
      doc.setTextColor(13, 59, 17); doc.setFontSize(9); doc.setFont("helvetica", "bold");
      doc.text(item.value, x + 4, y + 11);
    });

    y = 75;
    doc.setFillColor(249, 250, 251); doc.roundedRect(ml, y, contentW, 30, 3, 3, "F");
    doc.setDrawColor(200, 230, 200); doc.roundedRect(ml, y, contentW, 30, 3, 3, "S");
    doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(46, 125, 50);
    doc.text("BILL TO", ml + 5, y + 7);
    doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(17, 24, 39);
    doc.text(quotation.customerName || "N/A", ml + 5, y + 14);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(75, 85, 99);
    if (quotation.customerPhone) doc.text(`Phone: ${quotation.customerPhone}`, ml + 5, y + 21);
    if (quotation.customerAddress) doc.text(quotation.customerAddress, ml + 5, y + 27);

    y = 115;
    const products = quotation.products || [{ name: quotation.droneModel, description: "", quantity: quotation.quantity, unitPrice: quotation.unitPrice, gstRate: quotation.taxRate || 18 }];
    doc.setFillColor(13, 59, 17); doc.rect(ml, y, contentW, 9, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    const colX = [ml + 2, ml + 10, ml + 80, ml + 105, ml + 135, ml + 160];
    ["#", "Product / Description", "Qty", "Unit Price", "GST", "Total"].forEach((h, i) => doc.text(h, colX[i], y + 6));
    y += 9;

    products.forEach((p, idx) => {
      if (idx % 2 === 0) { doc.setFillColor(248, 254, 248); doc.rect(ml, y, contentW, 14, "F"); }
      doc.setTextColor(17, 24, 39); doc.setFontSize(8); doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}`, colX[0], y + 5.5);
      const nameLines = doc.splitTextToSize(p.name || "", 66);
      doc.text(nameLines[0] || "", colX[1], y + 5.5);
      if (nameLines[1]) { doc.setFont("helvetica", "normal"); doc.setTextColor(75, 85, 99); doc.text(nameLines[1], colX[1], y + 10); }
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(17, 24, 39);
      doc.text(`${p.quantity || 1}`, colX[2], y + 5.5);
      doc.text(fmt(p.unitPrice), colX[3], y + 5.5);
      doc.text(`${p.gstRate || 0}%`, colX[4], y + 5.5);
      doc.setFont("helvetica", "bold");
      doc.text(fmt((p.quantity || 1) * (p.unitPrice || 0)), colX[5], y + 5.5);
      doc.setDrawColor(229, 231, 235); doc.line(ml, y + 14, ml + contentW, y + 14);
      y += 14;
    });

    y += 5;
    const totW = 85, totX = pw - mr - totW;
    const addRow = (label, value, bold) => {
      if (bold) { doc.setFillColor(13, 59, 17); doc.roundedRect(totX - 5, y - 1, totW + 5, 10, 2, 2, "F"); }
      doc.setFont("helvetica", bold ? "bold" : "normal"); doc.setFontSize(bold ? 9.5 : 8.5);
      doc.setTextColor(bold ? 255 : 75, bold ? 255 : 85, bold ? 255 : 99);
      doc.text(label, totX, y + 6); doc.text(value, pw - mr, y + 6, { align: "right" }); y += 9;
    };
    const subtotal = products.reduce((s, p) => s + (p.quantity || 1) * (p.unitPrice || 0), 0);
    const gstGroups = {};
    products.forEach(p => { const r = p.gstRate || 0; if (!gstGroups[r]) gstGroups[r] = 0; gstGroups[r] += (p.quantity || 1) * (p.unitPrice || 0) * (r / 100); });
    const totalGST = Object.values(gstGroups).reduce((s, v) => s + v, 0);
    const discAmt = subtotal * ((quotation.discount || 0) / 100);
    const addons = quotation.addonsTotal || 0;
    const shipping = quotation.shipping || 0;
    const grand = quotation.grandTotal || (subtotal + totalGST - discAmt + addons + shipping);
    addRow("Subtotal", fmt(subtotal), false);
    Object.entries(gstGroups).forEach(([rate, amt]) => { if (amt > 0) addRow(`GST (${rate}%)`, fmt(amt), false); });
    if (discAmt > 0) addRow(`Discount (${quotation.discount}%)`, `-${fmt(discAmt)}`, false);
    if (addons > 0) addRow("Add-ons", fmt(addons), false);
    if (shipping > 0) addRow("Shipping", fmt(shipping), false);
    addRow("Grand Total", fmt(grand), true);

    y += 10;
    if (y > ph - 55) { doc.addPage(); y = 20; }
    doc.setFillColor(248, 254, 248); doc.roundedRect(ml, y, contentW, 28, 3, 3, "F");
    doc.setDrawColor(200, 230, 200); doc.roundedRect(ml, y, contentW, 28, 3, 3, "S");
    doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(46, 125, 50);
    doc.text("TERMS & CONDITIONS", ml + 5, y + 7);
    doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(75, 85, 99);
    ["• This quotation is valid for 30 days.", "• 50% advance payment required before production.", "• Delivery within 15–20 working days after confirmation.", "• Prices include taxes as mentioned above."].forEach((t, i) => doc.text(t, ml + 5, y + 13 + i * 4));

    doc.setFillColor(13, 27, 15); doc.rect(0, ph - 18, pw, 18, "F");
    doc.setTextColor(160, 220, 160); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("GOAG SERVICES PVT LTD | Agricultural Drone Solutions", pw / 2, ph - 10, { align: "center" });
    doc.save(`Quotation_${(quotation.customerName || "Customer").replace(/\s+/g, "_")}_${quotation.number || "QTN"}.pdf`);
  });
}

function generateReportPDF(quotations, orders, period, year) {
  loadJsPDF(() => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = 210, ph = 297, ml = 15, mr = 15, contentW = pw - ml - mr;
    let y = 0;

    doc.setFillColor(13, 27, 15); doc.rect(0, 0, pw, 40, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text("GOAG SERVICES PVT LTD", ml, 17);
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(160, 220, 160);
    doc.text("Sales Report", ml, 24);
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(period === "monthly" ? `Year ${year}` : "All Years", pw - mr, 17, { align: "right" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(160, 220, 160);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, pw - mr, 24, { align: "right" });

    y = 50;
    const validQ = quotations.filter(q => q.status !== "rejected");
    const totalOrders = orders;
    const totalValue = totalOrders.reduce((s, o) => s + o.total_amount, 0);

    const summaryData = [
      { label: "Total Quotations", value: String(validQ.length) },
      { label: "Total Orders", value: String(totalOrders.length) },
      { label: "Total Revenue", value: fmt(totalValue) },
      { label: "Conversion Rate", value: totalOrders.length > 0 && validQ.length > 0 ? `${Math.round((totalOrders.length / validQ.length) * 100)}%` : "0%" },
    ];
    const boxW = (contentW - 9) / 4;
    summaryData.forEach((s, i) => {
      const x = ml + i * (boxW + 3);
      doc.setFillColor(232, 245, 233); doc.roundedRect(x, y, boxW, 22, 3, 3, "F");
      doc.setTextColor(46, 125, 50); doc.setFontSize(7); doc.setFont("helvetica", "bold");
      doc.text(s.label.toUpperCase(), x + 3, y + 7);
      doc.setTextColor(13, 59, 17); doc.setFontSize(11); doc.setFont("helvetica", "bold");
      doc.text(s.value, x + 3, y + 17);
    });

    y += 32;

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    doc.setFillColor(13, 59, 17); doc.rect(ml, y, contentW, 9, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("Period", ml + 3, y + 6);
    doc.text("Quotations", ml + 45, y + 6);
    doc.text("Orders", ml + 90, y + 6);
    doc.text("Revenue", pw - mr - 3, y + 6, { align: "right" });
    y += 9;

    if (period === "monthly") {
      for (let m = 1; m <= 12; m++) {
        const mQ = validQ.filter(q => { const d = new Date(q.createdDate); return d.getFullYear() === year && d.getMonth() + 1 === m; });
        const mO = orders.filter(o => { const d = new Date(o.created_at); return d.getFullYear() === year && d.getMonth() + 1 === m; });
        const mV = mO.reduce((s, o) => s + o.total_amount, 0);
        if ((m - 1) % 2 === 0) { doc.setFillColor(248, 254, 248); doc.rect(ml, y, contentW, 9, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(55, 65, 81);
        doc.text(MONTHS[m - 1] + " " + year, ml + 3, y + 6);
        doc.text(String(mQ.length), ml + 45, y + 6);
        doc.setFont("helvetica", "bold"); doc.setTextColor(mO.length > 0 ? 46 : 107, mO.length > 0 ? 125 : 114, mO.length > 0 ? 50 : 128);
        doc.text(String(mO.length), ml + 90, y + 6);
        doc.setFont("helvetica", "normal"); doc.setTextColor(55, 65, 81);
        doc.text(mV > 0 ? fmt(mV) : "—", pw - mr - 3, y + 6, { align: "right" });
        doc.setDrawColor(229, 231, 235); doc.line(ml, y + 9, ml + contentW, y + 9);
        y += 9;
      }
    } else {
      const allYears = [...new Set(orders.map(o => new Date(o.created_at).getFullYear()))].sort();
      allYears.forEach((yr, idx) => {
        const yO = orders.filter(o => new Date(o.created_at).getFullYear() === yr);
        const yQ = validQ.filter(q => new Date(q.createdDate).getFullYear() === yr);
        const yV = yO.reduce((s, o) => s + o.total_amount, 0);
        if (idx % 2 === 0) { doc.setFillColor(248, 254, 248); doc.rect(ml, y, contentW, 9, "F"); }
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(55, 65, 81);
        doc.text(String(yr), ml + 3, y + 6);
        doc.text(String(yQ.length), ml + 45, y + 6);
        doc.setFont("helvetica", "bold"); doc.setTextColor(46, 125, 50);
        doc.text(String(yO.length), ml + 90, y + 6);
        doc.setFont("helvetica", "normal"); doc.setTextColor(55, 65, 81);
        doc.text(yV > 0 ? fmt(yV) : "—", pw - mr - 3, y + 6, { align: "right" });
        doc.setDrawColor(229, 231, 235); doc.line(ml, y + 9, ml + contentW, y + 9);
        y += 9;
      });
    }

    doc.setFillColor(13, 27, 15); doc.rect(0, ph - 18, pw, 18, "F");
    doc.setTextColor(160, 220, 160); doc.setFontSize(8);
    doc.text("GOAG SERVICES PVT LTD | Confidential Sales Report", pw / 2, ph - 10, { align: "center" });
    doc.save(`Sales_Report_${period === "monthly" ? year : "AllYears"}.pdf`);
  });
}

// ── Helper: Get unique customers ────────────────────────────────────────────
const getUniqueCustomers = (customerList) => {
  const seen = new Map();
  return customerList.filter(c => {
    const key = (c.email || c.phone || c.id || '').toString();
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
};

// ── Editable Quotation Modal ────────────────────────────────────────────────
function QuotationEditModal({ isOpen, onClose, onSave, customers, initial }) {
  const empty = { customerId: "", customerName: "", customerPhone: "", customerAddress: "", products: [{ id: 1, name: "", description: "", quantity: 1, unitPrice: 0, gstRate: 18 }], discount: 0, shipping: 0, addons: { extraBattery: false, propellerSet: false, carryingCase: false, extendedWarranty: false, spareParts: false, fastCharger: false } };
  const [form, setForm] = useState(empty);
  const isEdit = !!initial;

  useEffect(() => {
    if (isOpen) {
      if (initial) {
        const products = initial.products || [{ id: 1, name: initial.droneModel || "", description: "", quantity: initial.quantity || 1, unitPrice: initial.unitPrice || 0, gstRate: initial.taxRate || 18 }];
        const addonState = {};
        Object.keys(ADDON_LABELS).forEach(k => { addonState[k] = false; });
        setForm({ customerId: String(initial.customerId || ""), customerName: initial.customerName || "", customerPhone: initial.customerPhone || "", customerAddress: initial.customerAddress || "", products, discount: initial.discount || 0, shipping: initial.shipping || 0, addons: addonState });
      } else { setForm(empty); }
    }
  }, [isOpen, initial]);

  const calcTotals = () => {
    const sub = form.products.reduce((s, p) => s + p.quantity * p.unitPrice, 0);
    const gst = form.products.reduce((s, p) => s + p.quantity * p.unitPrice * (p.gstRate / 100), 0);
    const addonsTotal = Object.entries(form.addons).reduce((s, [k, v]) => s + (v ? ADDON_PRICES[k] : 0), 0);
    const disc = sub * (form.discount / 100);
    return { sub, gst, addonsTotal, disc, grand: sub + gst - disc + addonsTotal + (form.shipping || 0) };
  };

  const t = calcTotals();
  const addProduct = () => setForm(f => ({ ...f, products: [...f.products, { id: Date.now(), name: "", description: "", quantity: 1, unitPrice: 0, gstRate: 18 }] }));
  const removeProduct = (id) => { if (form.products.length === 1) return; setForm(f => ({ ...f, products: f.products.filter(p => p.id !== id) })); };
  const updateProduct = (id, field, value) => setForm(f => ({ ...f, products: f.products.map(p => p.id === id ? { ...p, [field]: (field === "quantity" || field === "unitPrice") ? (parseFloat(value) || 0) : value } : p) }));

  const handleCustomer = (val) => {
    const c = customers.find(c => c.id === parseInt(val));
    setForm(f => ({ ...f, customerId: val, customerName: c?.name || "", customerPhone: c?.phone || "", customerAddress: c?.address || "" }));
  };

  const handleSubmit = () => {
    if (!form.customerId) return alert("Please select a customer");
    if (!form.products[0].name) return alert("Please enter at least one product");
    const num = initial?.number || `QTN-${Date.now().toString().slice(-10)}`;
    onSave({
      ...(initial || {}),
      id: initial?.id || Date.now(),
      number: num,
      customerId: parseInt(form.customerId),
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      products: form.products,
      droneModel: form.products.map(p => p.name).join(", "),
      quantity: form.products.reduce((s, p) => s + p.quantity, 0),
      unitPrice: form.products[0]?.unitPrice || 0,
      discount: form.discount,
      shipping: form.shipping,
      addonsTotal: t.addonsTotal,
      grandTotal: t.grand,
      status: initial?.status || "pending",
      createdDate: initial?.createdDate || new Date().toISOString(),
      isCustom: true,
    });
    onClose();
  };

  if (!isOpen) return null;
  
  const uniqueCustomers = getUniqueCustomers(customers);
  
  return (
    <div style={css.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...css.modalBox, maxHeight: "95vh" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${G.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white", zIndex: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: isEdit ? G.blue : G.amber }}>{isEdit ? "✏️ Edit Quotation" : "⚙️ Custom Quotation"}</h3>
            {isEdit && <p style={{ margin: 0, fontSize: 12, color: G.gray500 }}>{initial?.number}</p>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><ICONS.x /></button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={css.label}>Customer <span style={{ color: G.red }}>*</span></label>
            <select value={form.customerId} onChange={(e) => handleCustomer(e.target.value)} style={css.select}>
              <option value="">Choose customer</option>
              {uniqueCustomers.map(c => (
                <option key={c.id} value={c.id}>{c.customerCode} – {c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ ...css.label, margin: 0 }}>Products</label>
            <button type="button" onClick={addProduct} style={{ ...css.btn(G[600]), fontSize: 12, padding: "5px 10px" }}><ICONS.plus /> Add Row</button>
          </div>
          <div style={{ overflowX: "auto", marginBottom: 14 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 580, fontSize: 12 }}>
              <thead>
                <tr style={{ background: G.gray50 }}>
                  {["#", "Product Name", "Qty", "Price (₹)", "GST%", "Total", ""].map(h => (
                    <th key={h} style={{ padding: "8px 6px", textAlign: h === "Total" || h === "Price (₹)" ? "right" : "left", fontSize: 11, fontWeight: 700, color: G.gray600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {form.products.map((p, idx) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${G.gray100}` }}>
                    <td style={{ padding: "8px 6px", color: G.gray500 }}>{idx + 1}</td>
                    <td style={{ padding: "4px 6px" }}>
                      <input value={p.name} onChange={(e) => updateProduct(p.id, "name", e.target.value)} placeholder="Product name" style={{ ...css.input, fontSize: 12, padding: "6px 8px" }} />
                      <input value={p.description} onChange={(e) => updateProduct(p.id, "description", e.target.value)} placeholder="Description (opt)" style={{ ...css.input, fontSize: 11, padding: "4px 8px", marginTop: 3, color: G.gray500 }} />
                    </td>
                    <td style={{ padding: "4px 6px" }}>
                      <input type="number" min="1" value={p.quantity} onChange={(e) => updateProduct(p.id, "quantity", parseInt(e.target.value) || 1)} style={{ ...css.input, width: 55, padding: "6px 8px", fontSize: 12 }} />
                    </td>
                    <td style={{ padding: "4px 6px" }}>
                      <input type="number" value={p.unitPrice} onChange={(e) => updateProduct(p.id, "unitPrice", parseFloat(e.target.value) || 0)} style={{ ...css.input, width: 100, padding: "6px 8px", textAlign: "right", fontSize: 12 }} />
                    </td>
                    <td style={{ padding: "4px 6px" }}>
                      <select value={p.gstRate} onChange={(e) => updateProduct(p.id, "gstRate", parseInt(e.target.value))} style={{ ...css.select, width: 60, padding: "6px 8px", fontSize: 12 }}>
                        {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "4px 6px", textAlign: "right", fontWeight: 700, color: G[600], fontSize: 12 }}>{fmt(p.quantity * p.unitPrice)}</td>
                    <td style={{ padding: "4px 6px" }}>
                      <button type="button" onClick={() => removeProduct(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: G.red, padding: 2 }}><ICONS.trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={css.label}>Quick Add-ons</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(ADDON_LABELS).map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", padding: "8px 10px", borderRadius: 8, border: `1.5px solid ${form.addons[key] ? G[500] : G.gray200}`, background: form.addons[key] ? G[50] : "white", transition: "all 0.2s" }}>
                  <input type="checkbox" checked={form.addons[key]} onChange={() => setForm(f => ({ ...f, addons: { ...f.addons, [key]: !f.addons[key] } }))} />
                  <span style={{ flex: 1 }}>{label}</span>
                  <span style={{ color: G[600], fontWeight: 600 }}>{fmt(ADDON_PRICES[key])}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={css.label}>Discount (%)</label>
              <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm(f => ({ ...f, discount: parseFloat(e.target.value) || 0 }))} style={css.input} />
            </div>
            <div>
              <label style={css.label}>Shipping (₹)</label>
              <input type="number" min="0" value={form.shipping} onChange={(e) => setForm(f => ({ ...f, shipping: parseFloat(e.target.value) || 0 }))} style={css.input} />
            </div>
          </div>

          <div style={{ background: G[50], borderRadius: 12, padding: 16, marginBottom: 20 }}>
            {[["Subtotal", fmt(t.sub)], ["GST", fmt(t.gst)], t.addonsTotal > 0 ? ["Add-ons", fmt(t.addonsTotal)] : null, form.discount > 0 ? [`Discount (${form.discount}%)`, `-${fmt(t.disc)}`] : null, form.shipping > 0 ? ["Shipping", fmt(form.shipping)] : null].filter(Boolean).map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, color: G.gray600 }}><span>{l}</span><span>{v}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 8, borderTop: `2px solid ${G[400]}`, fontSize: 16, fontWeight: 700, color: G[700] }}>
              <span>Grand Total</span><span>{fmt(t.grand)}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={onClose} style={{ ...css.btn(G.gray100, G.gray700), flex: 1, justifyContent: "center" }}>Cancel</button>
            <button type="button" onClick={handleSubmit} style={{ ...css.btn(isEdit ? G.blue : G.amber), flex: 2, justifyContent: "center" }}>{isEdit ? <><ICONS.save /> Update</> : <><ICONS.plus /> Create</>}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Prefilled quotation modal ────────────────────────────────────────────────
function PrefilledModal({ isOpen, onClose, onSave, customers, droneModels }) {
  const [prefilled, setPrefilled] = useState({ customerId: "", customerName: "", customerPhone: "", droneModelId: "", quantity: 1 });
  useEffect(() => { if (isOpen) setPrefilled({ customerId: "", customerName: "", customerPhone: "", droneModelId: "", quantity: 1 }); }, [isOpen]);
  if (!isOpen) return null;

  const allC = getUniqueCustomers(customers);
  const handleCustomer = (val) => {
    const c = allC.find(c => c.id === parseInt(val));
    setPrefilled({ ...prefilled, customerId: val, customerName: c?.name || "", customerPhone: c?.phone || "" });
  };

  const handleSubmit = () => {
    const drone = droneModels.find(d => d.id === parseInt(prefilled.droneModelId));
    if (!drone) return alert("Select a drone model");
    const total = prefilled.quantity * drone.price;
    const tax = total * (drone.taxRate / 100);
    const num = `QTN-${Date.now().toString().slice(-10)}`;
    onSave({ id: Date.now(), number: num, customerId: parseInt(prefilled.customerId), customerName: prefilled.customerName, customerPhone: prefilled.customerPhone, droneModelId: prefilled.droneModelId, droneModel: drone.name, quantity: prefilled.quantity, unitPrice: drone.price, total, tax, grandTotal: total + tax, taxRate: drone.taxRate, status: "pending", createdDate: new Date().toISOString() });
    onClose();
  };

  const drone = droneModels.find(d => d.id === parseInt(prefilled.droneModelId));
  const sub = drone ? prefilled.quantity * drone.price : 0;
  const gst = drone ? sub * (drone.taxRate / 100) : 0;

  return (
    <div style={css.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${G.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: G[600] }}>📦 Prefilled Quotation</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><ICONS.x /></button>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={css.label}>Customer <span style={{ color: G.red }}>*</span></label>
            <select value={prefilled.customerId} onChange={(e) => handleCustomer(e.target.value)} style={css.select}>
              <option value="">Choose customer</option>
              {allC.map(c => <option key={c.id} value={c.id}>{c.customerCode} – {c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={css.label}>Drone Model <span style={{ color: G.red }}>*</span></label>
            <select value={prefilled.droneModelId} onChange={(e) => setPrefilled({ ...prefilled, droneModelId: e.target.value })} style={css.select}>
              <option value="">Choose model</option>
              {droneModels.map(d => <option key={d.id} value={d.id}>{d.name} – {fmt(d.price)}</option>)}
            </select>
          </div>
          <div>
            <label style={css.label}>Quantity</label>
            <input type="number" min="1" value={prefilled.quantity} onChange={(e) => setPrefilled({ ...prefilled, quantity: parseInt(e.target.value) || 1 })} style={css.input} />
          </div>
          {drone && (
            <div style={{ background: G[50], borderRadius: 10, padding: 12 }}>
              {[["Subtotal", fmt(sub)], [`GST (${drone.taxRate}%)`, fmt(gst)], ["Total", fmt(sub + gst)]].map(([l, v], i) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: i === 2 ? 15 : 12, fontWeight: i === 2 ? 700 : 400, color: i === 2 ? G[700] : G.gray600, padding: "3px 0", ...(i === 2 ? { borderTop: `2px solid ${G[400]}`, paddingTop: 8, marginTop: 6 } : {}) }}><span>{l}</span><span>{v}</span></div>
              ))}
            </div>
          )}
          <button type="button" onClick={handleSubmit} style={{ ...css.btn(G[600]), justifyContent: "center", padding: "12px 16px", borderRadius: 10 }}>Create Quotation</button>
        </div>
      </div>
    </div>
  );
}

// ── Proforma Invoice Modal ───────────────────────────────────────────────────
function ProformaModal({ quotation, onClose }) {
  if (!quotation) return null;
  const products = quotation.products || [{ name: quotation.droneModel, description: "", quantity: quotation.quantity, unitPrice: quotation.unitPrice, gstRate: quotation.taxRate || 18 }];
  const sub = products.reduce((s, p) => s + (p.quantity || 1) * (p.unitPrice || 0), 0);
  const gst = products.reduce((s, p) => s + (p.quantity || 1) * (p.unitPrice || 0) * ((p.gstRate || 0) / 100), 0);
  const disc = sub * ((quotation.discount || 0) / 100);
  const grand = quotation.grandTotal || (sub + gst - disc + (quotation.shipping || 0));

  return (
    <div style={css.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={css.modalBox}>
        <div style={{ background: "#0D1B0F", padding: "16px", borderRadius: "20px 20px 0 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ margin: 0, color: "white", fontSize: 16, fontWeight: 700 }}>GOAG SERVICES PVT LTD</h2>
              <p style={{ margin: "2px 0 0", color: "#A5D6A7", fontSize: 11 }}>Agricultural Drone Solutions</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "white" }}><ICONS.x /></button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <div><p style={{ margin: 0, fontSize: 11, color: "#A5D6A7" }}>QUOTATION NO</p><p style={{ margin: "2px 0 0", color: "white", fontWeight: 700, fontSize: 14 }}>{quotation.number}</p></div>
            <div style={{ textAlign: "right" }}><p style={{ margin: 0, fontSize: 11, color: "#A5D6A7" }}>DATE</p><p style={{ margin: "2px 0 0", color: "white", fontWeight: 700, fontSize: 14 }}>{fmtDate(quotation.createdDate)}</p></div>
          </div>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ background: G[50], borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, color: G[600], textTransform: "uppercase" }}>Bill To</p>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{quotation.customerName}</p>
            {quotation.customerPhone && <p style={{ margin: "2px 0 0", fontSize: 12, color: G.gray600 }}>📞 {quotation.customerPhone}</p>}
            {quotation.customerAddress && <p style={{ margin: "2px 0 0", fontSize: 12, color: G.gray600 }}>📍 {quotation.customerAddress}</p>}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
            <thead>
              <tr style={{ background: "#0D1B0F" }}>
                {["Product", "Qty", "Price", "Total"].map(h => <th key={h} style={{ padding: "8px", color: "white", fontSize: 11, fontWeight: 700, textAlign: h === "Total" || h === "Price" ? "right" : "left" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? G[50] : "white", borderBottom: `1px solid ${G.gray100}` }}>
                  <td style={{ padding: "10px 8px" }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>{p.name}</p>
                    {p.description && <p style={{ margin: "2px 0 0", fontSize: 11, color: G.gray500 }}>{p.description}</p>}
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: G[600] }}>GST: {p.gstRate || 0}%</p>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 600 }}>{p.quantity || 1}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right" }}>{fmt(p.unitPrice)}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: G[700] }}>{fmt((p.quantity || 1) * (p.unitPrice || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ background: G[50], borderRadius: 10, padding: 14, marginBottom: 16 }}>
            {[["Subtotal", fmt(sub)], gst > 0 ? ["GST", fmt(gst)] : null, quotation.discount > 0 ? [`Discount (${quotation.discount}%)`, `-${fmt(disc)}`] : null, (quotation.addonsTotal || 0) > 0 ? ["Add-ons", fmt(quotation.addonsTotal)] : null, (quotation.shipping || 0) > 0 ? ["Shipping", fmt(quotation.shipping)] : null].filter(Boolean).map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: G.gray600 }}><span>{l}</span><span>{v}</span></div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", marginTop: 8, borderTop: `2px solid ${G[500]}`, fontSize: 16, fontWeight: 700, color: G[700] }}><span>Grand Total</span><span>{fmt(grand)}</span></div>
          </div>
          <div style={{ background: G.gray50, borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: G[600], textTransform: "uppercase" }}>Terms & Conditions</p>
            {["Valid for 30 days from issue date.", "50% advance required before production.", "Delivery within 15–20 working days after confirmation."].map(t => <p key={t} style={{ margin: "3px 0", fontSize: 11, color: G.gray600 }}>• {t}</p>)}
          </div>
          <button onClick={() => generateQuotationPDF({ ...quotation, products })} style={{ ...css.btn("#0D1B0F"), width: "100%", justifyContent: "center", padding: "12px 16px", borderRadius: 12, fontSize: 14 }}>
            <ICONS.download /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Order Tracking Modal ─────────────────────────────────────────────────────
function OrderModal({ order, onClose, onUpdateStatus, quotations, onEditQuotation }) {
  if (!order) return null;
  const current = TRACKING_STAGES.indexOf(order.status);
  const linkedQ = quotations?.find(q => q.id === order.quotation_id);

  return (
    <div style={css.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={css.modalBox}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${G.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Order Tracking</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: G.gray500 }}>{order.order_number}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><ICONS.x /></button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ background: G.gray50, borderRadius: 12, padding: 14, marginBottom: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["Customer", order.customer_name], ["Customer ID", order.customer_code], ["Product", order.products?.[0]?.name], ["Quantity", `${order.products?.[0]?.qty || 0} units`], ["Amount", fmt(order.total_amount)], ["Delivery", fmtDate(order.delivery_date)]].map(([l, v]) => (
                <div key={l}><p style={{ margin: 0, fontSize: 11, color: G.gray500 }}>{l}</p><p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: G.gray800 }}>{v}</p></div>
              ))}
            </div>
            {linkedQ && onEditQuotation && (
              <button onClick={() => { onClose(); onEditQuotation(linkedQ); }} style={{ ...css.btn(G.blue), marginTop: 12, fontSize: 12, padding: "6px 12px" }}>
                <ICONS.edit /> Edit Linked Quotation
              </button>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: G.gray700 }}>Journey</p>
            <div style={{ display: "flex", alignItems: "center", overflowX: "auto", paddingBottom: 8 }}>
              {STAGE_LABELS.map((label, i) => {
                const done = i <= current;
                const active = i === current;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STAGE_LABELS.length - 1 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? G[600] : G.gray200, border: active ? `3px solid ${G.amber}` : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {done ? <span style={{ color: "white", fontSize: 11 }}>✓</span> : <span style={{ color: G.gray400, fontSize: 10 }}>{i + 1}</span>}
                      </div>
                      <span style={{ fontSize: 9, color: done ? G[600] : G.gray400, fontWeight: done ? 700 : 400, marginTop: 4, textAlign: "center", whiteSpace: "nowrap" }}>{label}</span>
                    </div>
                    {i < STAGE_LABELS.length - 1 && <div style={{ flex: 1, height: 2, background: i < current ? G[400] : G.gray200, minWidth: 16 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 600, color: G.gray600 }}>Update Status</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TRACKING_STAGES.slice(1).map((status, i) => {
                const idx = i + 1;
                const disabled = idx <= current;
                return <button key={status} onClick={() => { onUpdateStatus(order.id, status); onClose(); }} disabled={disabled} style={{ padding: "6px 12px", borderRadius: 20, border: "none", background: disabled ? G.gray100 : G[600], color: disabled ? G.gray400 : "white", cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600 }}>{(STATUS_MAP[status] || {}).label || status}</button>;
              })}
            </div>
          </div>

          <div>
            <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: G.gray700 }}>Activity History</p>
            <div style={{ borderLeft: `2px solid ${G[200]}`, marginLeft: 10, paddingLeft: 18 }}>
              {(order.tracking?.history || []).map((item, i) => (
                <div key={i} style={{ marginBottom: 14, position: "relative" }}>
                  <div style={{ position: "absolute", left: -23, top: 2, width: 10, height: 10, borderRadius: "50%", background: i === 0 ? G[600] : G.gray300, border: "2px solid white" }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: G.gray800 }}>{(STATUS_MAP[item.status] || {}).label || item.status}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: G.gray500 }}>{fmtDateTime(item.date)}</p>
                  {item.message && <p style={{ margin: "3px 0 0", fontSize: 12, color: G.gray600 }}>{item.message}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Customer Detail Modal ─────────────────────────────────────────────────────
function CustomerModal({ customer, onClose, onEdit, orders, quotations }) {
  const [editing, setEditing] = useState(null);
  if (!customer) return null;

  const custOrders = orders.filter(o => o.customer_id === customer.id || o.customer_code === customer.customerCode);
  const custQuotations = quotations.filter(q => q.customerId === customer.id);
  const totalSpent = custOrders.reduce((s, o) => s + o.total_amount, 0);

  const handleSave = () => { onEdit(editing); setEditing(null); };

  const fakeServiceHistory = (orderId, orderNumber) => {
    const seed = orderId % 100;
    const services = [];
    if (seed > 20) services.push({ date: new Date(Date.now() - 90 * 864e5).toISOString(), type: "Annual Maintenance", status: "Completed", tech: "Ravi Kumar", cost: 3500 });
    if (seed > 40) services.push({ date: new Date(Date.now() - 45 * 864e5).toISOString(), type: "Motor Replacement", status: "Completed", tech: "Suresh M", cost: 12000 });
    if (seed > 60) services.push({ date: new Date(Date.now() - 10 * 864e5).toISOString(), type: "Software Update", status: "Completed", tech: "Tech Team", cost: 0 });
    return services;
  };

  return (
    <div style={css.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={css.modalBox}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${G.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Customer Profile</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: G[600], fontWeight: 700 }}>{customer.customerCode}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><ICONS.x /></button>
        </div>
        <div style={{ padding: 16 }}>
          {editing ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[["name", "Name"], ["phone", "Phone"], ["email", "Email"], ["address", "Address"], ["city", "City"], ["district", "District"], ["state", "State"], ["pincode", "Pincode"], ["gst", "GST Number"]].map(([field, label]) => (
                  <div key={field} style={{ gridColumn: field === "address" ? "1 / -1" : "auto" }}>
                    <label style={css.label}>{label}</label>
                    <input value={editing[field] || ""} onChange={(e) => setEditing({ ...editing, [field]: e.target.value })} style={css.input} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setEditing(null)} style={{ ...css.btn(G.gray100, G.gray700), flex: 1, justifyContent: "center" }}>Cancel</button>
                <button onClick={handleSave} style={{ ...css.btn(G[600]), flex: 1, justifyContent: "center" }}><ICONS.save /> Save</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
                {[{ label: "Orders", value: custOrders.length, color: G[600] }, { label: "Total Spent", value: fmt(totalSpent), color: G.amber }, { label: "Quotations", value: custQuotations.length, color: G.blue }].map(s => (
                  <div key={s.label} style={{ background: G[50], borderRadius: 12, padding: "12px 10px", textAlign: "center", border: `1px solid ${G[100]}` }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: G.gray500 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              <div style={{ background: G.gray50, borderRadius: 12, padding: 14, marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: G.gray600, textTransform: "uppercase" }}>Contact Info</p>
                  <button onClick={() => setEditing({ ...customer })} style={{ ...css.btn(G.blue), fontSize: 11, padding: "5px 10px" }}><ICONS.edit /> Edit</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[["Customer ID", customer.customerCode], ["Name", customer.name], ["Phone", customer.phone], ["Email", customer.email || "—"], ["City", customer.city || "—"], ["State", customer.state || "—"], ["GST", customer.gst || "—"], ["Pincode", customer.pincode || "—"]].map(([l, v]) => (
                    <div key={l}>
                      <p style={{ margin: 0, fontSize: 10, color: G.gray500 }}>{l}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: l === "Customer ID" ? G[600] : G.gray800 }}>{v}</p>
                    </div>
                  ))}
                </div>
                {customer.address && <div style={{ marginTop: 8 }}><p style={{ margin: 0, fontSize: 10, color: G.gray500 }}>Address</p><p style={{ margin: "2px 0 0", fontSize: 12, color: G.gray700 }}>{customer.address}</p></div>}
              </div>

              <div style={{ marginBottom: 18 }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: G.gray800 }}>🚁 Drone Purchases</p>
                {custOrders.length === 0 ? (
                  <div style={{ background: G.gray50, borderRadius: 10, padding: 20, textAlign: "center", color: G.gray400, fontSize: 13 }}>No drone purchases yet</div>
                ) : custOrders.map(o => {
                  const services = fakeServiceHistory(o.id, o.order_number);
                  return (
                    <div key={o.id} style={{ background: "white", border: `1px solid ${G.gray200}`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: G.gray800 }}>{o.order_number}</span>
                            <Badge status={o.status} />
                          </div>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: G[700] }}>{o.products?.[0]?.name}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: G.gray500 }}>Qty: {o.products?.[0]?.qty || 1} · Ordered: {fmtDate(o.created_at)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G[600] }}>{fmt(o.total_amount)}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: G.gray400 }}>Delivery: {fmtDate(o.delivery_date)}</p>
                        </div>
                      </div>

                      <div style={{ background: G[50], borderRadius: 10, padding: 10 }}>
                        <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: G[600], textTransform: "uppercase" }}>Service History ({services.length})</p>
                        {services.length === 0 ? (
                          <p style={{ margin: 0, fontSize: 11, color: G.gray400 }}>No services logged</p>
                        ) : services.map((sv, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", borderBottom: i < services.length - 1 ? `1px solid ${G[100]}` : "none" }}>
                            <div>
                              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: G.gray800 }}>{sv.type}</p>
                              <p style={{ margin: "1px 0 0", fontSize: 11, color: G.gray500 }}>{fmtDate(sv.date)} · {sv.tech}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ ...css.badge("#D1FAE5", G[600]) }}>✓ {sv.status}</span>
                              <p style={{ margin: "3px 0 0", fontSize: 11, fontWeight: 600, color: sv.cost > 0 ? G.gray700 : G.gray400 }}>{sv.cost > 0 ? fmt(sv.cost) : "Free"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {custQuotations.length > 0 && (
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: G.gray800 }}>📋 Quotation History</p>
                  {custQuotations.map(q => (
                    <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: G.gray50, borderRadius: 10, marginBottom: 8 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: G.gray800 }}>{q.number}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: G.gray500 }}>{fmtDate(q.createdDate)}</p>
                      </div>
                      <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: G.gray700 }}>{fmt(q.grandTotal)}</span>
                        <Badge status={q.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Profile Modal ────────────────────────────────────────────────────────────
function ProfileModal({ isOpen, onClose, profile, onSave }) {
  const [form, setForm] = useState({ name: "", designation: "", phone: "", email: "", avatar: "" });
  const fileRef = useRef();
  useEffect(() => { if (isOpen && profile) setForm({ ...profile }); }, [isOpen, profile]);
  if (!isOpen) return null;

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div style={css.modal} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "white", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ padding: "16px", borderBottom: `1px solid ${G.gray200}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "white" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>My Profile</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><ICONS.x /></button>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: G[100], border: `3px solid ${G[300]}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, cursor: "pointer", position: "relative" }} onClick={() => fileRef.current?.click()}>
              {form.avatar ? <img src={form.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 36 }}>👤</span>}
              <div style={{ position: "absolute", bottom: 0, right: 0, background: G[600], borderRadius: "50%", padding: 6, display: "flex" }}><ICONS.camera /></div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} style={{ ...css.btn(G[50], G[700]), border: `1px solid ${G[200]}`, fontSize: 12 }}><ICONS.camera /> Change Photo</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[["name", "Full Name"], ["designation", "Designation"], ["phone", "Phone"], ["email", "Email"]].map(([f, l]) => (
              <div key={f}>
                <label style={css.label}>{l}</label>
                <input value={form[f] || ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} style={css.input} />
              </div>
            ))}
          </div>

          <div style={{ background: G[50], borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: G[600] }}>Preview</p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: G[100], overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {form.avatar ? <img src={form.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22 }}>👤</span>}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G.gray800 }}>{form.name || "Your Name"}</p>
                <p style={{ margin: "2px 0", fontSize: 12, color: G[600] }}>{form.designation || "Sales Manager"}</p>
                <p style={{ margin: 0, fontSize: 11, color: G.gray500 }}>{form.phone || "Phone"} · {form.email || "Email"}</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ ...css.btn(G.gray100, G.gray700), flex: 1, justifyContent: "center" }}>Cancel</button>
            <button onClick={() => { onSave(form); onClose(); }} style={{ ...css.btn(G[600]), flex: 2, justifyContent: "center" }}><ICONS.save /> Save Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reports Tab ──────────────────────────────────────────────────────────────
function ReportsTab({ quotations, orders }) {
  const [period, setPeriod] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getData = () => {
    const validQ = quotations.filter(q => q.status !== "rejected");
    if (period === "monthly") {
      const monthly = {};
      for (let m = 1; m <= 12; m++) {
        const mQ = validQ.filter(q => { const d = new Date(q.createdDate); return d.getFullYear() === year && d.getMonth() + 1 === m; });
        const mO = orders.filter(o => { const d = new Date(o.created_at); return d.getFullYear() === year && d.getMonth() + 1 === m; });
        monthly[m] = { approached: mQ.length, orders: mO.length, value: mO.reduce((s, o) => s + o.total_amount, 0) };
      }
      const totalQ = validQ.filter(q => new Date(q.createdDate).getFullYear() === year).length;
      const totalO = orders.filter(o => new Date(o.created_at).getFullYear() === year);
      return { monthly, approached: totalQ, ordersCount: totalO.length, value: totalO.reduce((s, o) => s + o.total_amount, 0) };
    } else {
      const yearly = {};
      const allYears = [...new Set(orders.map(o => new Date(o.created_at).getFullYear()))].sort();
      allYears.forEach(y => {
        const yO = orders.filter(o => new Date(o.created_at).getFullYear() === y);
        const yQ = validQ.filter(q => new Date(q.createdDate).getFullYear() === y);
        yearly[y] = { approached: yQ.length, orders: yO.length, value: yO.reduce((s, o) => s + o.total_amount, 0) };
      });
      return { yearly, approached: validQ.length, ordersCount: orders.length, value: orders.reduce((s, o) => s + o.total_amount, 0) };
    }
  };

  const d = getData();
  const maxVal = period === "monthly"
    ? Math.max(...MONTHS.map((_, i) => (d.monthly || {})[i + 1]?.value || 0), 1)
    : Math.max(...Object.values(d.yearly || {}).map(v => v.value), 1);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: G.gray800 }}>Sales Reports</h2>
        <button onClick={() => generateReportPDF(quotations, orders, period, year)} style={{ ...css.btn(G[600]), padding: "9px 16px" }}>
          <ICONS.download /> Export PDF
        </button>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 20, border: `1px solid ${G.gray200}` }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div>
            <label style={css.label}>Period</label>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1.5px solid ${G.gray200}` }}>
              {["monthly", "yearly"].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{ padding: "7px 16px", border: "none", background: period === p ? G[600] : "white", color: period === p ? "white" : G.gray600, cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "capitalize" }}>{p}</button>
              ))}
            </div>
          </div>
          {period === "monthly" && (
            <div>
              <label style={css.label}>Year</label>
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ ...css.select, width: 100 }}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {[{ label: "Quotations", value: d.approached, color: G.blue, icon: "📋" }, { label: "Orders", value: d.ordersCount, color: G[600], icon: "📦" }, { label: "Revenue", value: fmt(d.value), color: G.amber, icon: "💰" }].map(s => (
          <div key={s.label} style={{ background: "white", borderRadius: 14, padding: 14, border: `1px solid ${G.gray200}`, textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <p style={{ margin: 0, fontSize: typeof s.value === "number" ? 22 : 14, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: G.gray500 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 16, border: `1px solid ${G.gray200}`, marginBottom: 20 }}>
        <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: G.gray700 }}>Revenue by {period === "monthly" ? "Month" : "Year"}</p>
        <div style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, minWidth: period === "monthly" ? 520 : "auto", height: 120, paddingBottom: 20 }}>
            {period === "monthly" ? MONTHS.map((m, i) => {
              const md = (d.monthly || {})[i + 1] || {};
              const h = maxVal > 0 ? Math.round((md.value / maxVal) * 100) : 0;
              return (
                <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div title={`${m}: ${fmt(md.value)}`} style={{ width: "100%", height: h + "%", background: h > 0 ? `linear-gradient(to top, ${G[600]}, ${G[400]})` : G.gray100, borderRadius: "4px 4px 0 0", minHeight: 3, transition: "height 0.3s", cursor: "pointer", position: "relative" }}>
                    {h > 0 && <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", fontSize: 8, color: G[600], fontWeight: 700, whiteSpace: "nowrap", marginBottom: 2 }}>{md.orders > 0 ? md.orders : ""}</div>}
                  </div>
                  <span style={{ fontSize: 8, color: G.gray500, marginTop: 4, transform: "rotate(-45deg)", transformOrigin: "center", display: "block" }}>{m.slice(0, 3)}</span>
                </div>
              );
            }) : Object.entries(d.yearly || {}).map(([yr, yd]) => {
              const h = maxVal > 0 ? Math.round((yd.value / maxVal) * 100) : 0;
              return (
                <div key={yr} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: "100%", height: h + "%", background: h > 0 ? G[600] : G.gray100, borderRadius: "4px 4px 0 0", minHeight: 3 }} />
                  <span style={{ fontSize: 11, color: G.gray500, marginTop: 4 }}>{yr}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, border: `1px solid ${G.gray200}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${G.gray200}`, background: G[50] }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: G.gray700 }}>{period === "monthly" ? `Monthly Breakdown – ${year}` : "Yearly Breakdown"}</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: G.gray50 }}>
                {["Period", "Quotations", "Orders", "Revenue"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: h === "Period" ? "left" : "right", fontSize: 11, fontWeight: 700, color: G.gray500 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {period === "monthly" ? MONTHS.map((m, i) => {
                const md = (d.monthly || {})[i + 1] || {};
                return (
                  <tr key={m} style={{ borderBottom: `1px solid ${G.gray100}`, background: i % 2 ? G.gray50 : "white" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 500, color: G.gray700 }}>{m}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: G.gray600 }}>{md.approached || 0}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: md.orders > 0 ? G[600] : G.gray400 }}>{md.orders || 0}</td>
                    <td style={{ padding: "10px 14px", textAlign: "right", color: md.value > 0 ? G.gray700 : G.gray400 }}>{md.value > 0 ? fmt(md.value) : "—"}</td>
                  </tr>
                );
              }) : Object.entries(d.yearly || {}).map(([yr, yd]) => (
                <tr key={yr} style={{ borderBottom: `1px solid ${G.gray100}` }}>
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: G.gray700 }}>{yr}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: G.gray600 }}>{yd.approached}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: G[600] }}>{yd.orders}</td>
                  <td style={{ padding: "10px 14px", textAlign: "right", color: G.gray700 }}>{fmt(yd.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - SALES MANAGER UI (FULLY FIXED)
// ══════════════════════════════════════════════════════════════════════════════
export default function SalesManagerUI({ user, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  const [savedCustomers, setSavedCustomers] = useState([]);
  const [droneModels, setDroneModels] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Modals
  const [showModal, setShowModal] = useState(null);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [showProforma, setShowProforma] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: "", designation: "Sales Manager", phone: "", email: "", avatar: "" });
  const [convertingId, setConvertingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [newCustomer, setNewCustomer] = useState({ name: "", email: "", phone: "", address: "", city: "", district: "", state: "", pincode: "", gst: "" });

  // ── Get Auth Token ──────────────────────────────────────────────────────
  const getAuthToken = () => {
    let token = localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('jwt');
    
    if (!token) {
      console.warn('⚠️ No token found');
      return null;
    }
    return token;
  };

  // ── Auto Login ─────────────────────────────────────────────────────────
  const autoLogin = async () => {
    try {
      console.log('🔐 Attempting auto-login...');
      const response = await fetch('http://localhost:5002/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@goag.com',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      console.log('📡 Login Response:', data);
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('✅ Auto-login successful');
        setIsAuthenticated(true);
        await loadData();
        setLoading(false);
        toast.success('Auto-login successful');
      } else {
        console.error('❌ Auto-login failed:', data.message);
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Auto-login error:', error.message);
      setIsAuthenticated(false);
      setLoading(false);
      toast.error('Failed to connect to server. Please check if backend is running.');
    }
  };

  // ── Load Data from Firebase ──────────────────────────────────────────────
  const loadData = async () => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load drone models
      const dronesRes = await droneAPI.getAll(token);
      if (dronesRes.success && dronesRes.data && dronesRes.data.length > 0) {
        setDroneModels(dronesRes.data);
      } else {
        const defaultDrones = [
          { id: 1, name: "AGRIFLOX® CROPS FERTIGINATE™", price: 321300, taxRate: 5 },
          { id: 2, name: "GOAG AgriSpray X1", price: 250000, taxRate: 18 },
          { id: 3, name: "Precision Sprayer Pro", price: 450000, taxRate: 18 },
        ];
        setDroneModels(defaultDrones);
      }

      // Load quotations
      const quotesRes = await quotationAPI.getAll(token);
      if (quotesRes.success && quotesRes.data) {
        setQuotations(quotesRes.data);
      }

      // Load orders
      const ordersRes = await orderAPI.getAll(token);
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }

      // Load customers with deduplication
      const usersRes = await userAPI.getAll(token);
      if (usersRes.success && usersRes.data) {
        const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}').email;
        
        const emailSet = new Set();
        const phoneSet = new Set();
        const idSet = new Set();
        
        const customerList = usersRes.data
          .filter(u => {
            if (u.role !== 'sales' && u.role !== 'customer') return false;
            if (u.email === currentUserEmail) return false;
            if (u.email?.includes('admin@goag.com')) return false;
            
            const emailKey = u.email?.toLowerCase() || '';
            const phoneKey = u.phone || '';
            const idKey = u.id || '';
            
            if (idKey && idSet.has(idKey)) return false;
            if (emailKey && emailSet.has(emailKey)) return false;
            if (phoneKey && phoneSet.has(phoneKey)) return false;
            
            if (idKey) idSet.add(idKey);
            if (emailKey) emailSet.add(emailKey);
            if (phoneKey) phoneSet.add(phoneKey);
            
            return true;
          })
          .map((u, index) => {
            const id = u.id || u.email || `customer_${Date.now()}_${index}`;
            return {
              id: id,
              customerCode: `GOAG-${String(index + 1).padStart(3, '0')}`,
              name: u.name || u.email?.split('@')[0] || 'Customer',
              email: u.email || '',
              phone: u.phone || '',
              address: u.address || '',
              city: u.city || '',
              district: u.district || '',
              state: u.state || '',
              pincode: u.pincode || '',
              gst: u.gst || '',
              created_at: u.createdAt || new Date().toISOString(),
              isSaved: true,
              _userData: u
            };
          });
        
        console.log(`✅ Loaded ${customerList.length} unique customers`);
        setSavedCustomers(customerList);
        setCustomers(customerList);
      }

      // Load profile
      const savedProfile = localStorage.getItem('sales_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  // ── Check Auth on Mount ──────────────────────────────────────────────────
  useEffect(() => {
    console.log('🔍 SalesManagerUI mounted');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('📋 Token:', token ? '✅ Yes' : '❌ No');
    console.log('📋 User:', userData ? '✅ Yes' : '❌ No');
    
    if (!token || !userData) {
      autoLogin();
    } else {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  // ── Customer CRUD ────────────────────────────────────────────────────────
  const addCustomer = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token required. Please login again.');
      autoLogin();
      return;
    }

    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Name and phone are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newCustomer.email && !emailRegex.test(newCustomer.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check for existing customer
    const existingCustomer = savedCustomers.find(c => 
      (c.email && c.email.toLowerCase() === (newCustomer.email || '').toLowerCase()) ||
      (c.phone && c.phone === newCustomer.phone)
    );

    if (existingCustomer) {
      toast.error(`Customer already exists: ${existingCustomer.name}`);
      return;
    }

    setLoading(true);
    try {
      const email = newCustomer.email || 
        `${newCustomer.name.toLowerCase().replace(/\s/g, '.')}@customer.goag.com`;

      // ✅ ONLY send fields that the backend allows
      const customerData = {
        name: newCustomer.name.trim(),
        email: email.trim().toLowerCase(),
        password: 'customer123',
        role: 'sales',
        department: 'Sales',
        phone: newCustomer.phone.trim()
      };

      console.log('📡 Creating customer:', customerData);
      const response = await userAPI.create(customerData, token);
      
      if (response.success) {
        toast.success(`Customer ${newCustomer.name} added successfully!`);
        setNewCustomer({ name: "", email: "", phone: "", address: "", city: "", district: "", state: "", pincode: "", gst: "" });
        setShowCustomerForm(false);
        setEditingCustomer(null);
        await loadData();
      } else {
        const errorMsg = response.errors 
          ? response.errors.map(e => e.message).join(', ')
          : response.message;
        toast.error(errorMsg || 'Failed to add customer');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer. Please try again.');
    }
    setLoading(false);
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      district: customer.district || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
      gst: customer.gst || ''
    });
    setShowCustomerForm(true);
  };

  const editCustomer = async (updated) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login again');
      return;
    }

    try {
      const updateData = {
        name: updated.name.trim(),
        phone: updated.phone.trim()
      };

      if (updated.address?.trim()) updateData.address = updated.address.trim();
      if (updated.city?.trim()) updateData.city = updated.city.trim();
      if (updated.district?.trim()) updateData.district = updated.district.trim();
      if (updated.state?.trim()) updateData.state = updated.state.trim();
      if (updated.pincode?.trim()) updateData.pincode = updated.pincode.trim();
      if (updated.gst?.trim()) updateData.gst = updated.gst.trim();

      // Use email as identifier
      const identifier = updated.email || updated.id;
      if (!identifier) {
        toast.error('Customer identifier not found');
        return;
      }

      const response = await userAPI.update(identifier, updateData, token);
      
      if (response.success) {
        toast.success('Customer updated successfully');
        await loadData();
        setEditingCustomer(null);
        setShowCustomerForm(false);
      } else {
        const errorMsg = response.errors 
          ? response.errors.map(e => e.message).join(', ')
          : response.message;
        toast.error(errorMsg || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Failed to update customer');
    }
  };

  const deleteCustomer = async (email) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login again');
      return;
    }

    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await userAPI.delete(email, token);
      if (response.success) {
        toast.success('Customer deleted successfully');
        await loadData();
      } else {
        toast.error(response.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  // ── Quotation CRUD ──────────────────────────────────────────────────────
  const saveQuotation = async (q) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login again');
      return;
    }

    try {
      const existing = quotations.find(x => x.id === q.id);
      let response;
      if (existing) {
        response = await quotationAPI.update(q.id, q, token);
      } else {
        response = await quotationAPI.create(q, token);
      }
      if (response.success) {
        await loadData();
        toast.success('Quotation saved successfully');
      } else {
        toast.error(response.message || 'Failed to save quotation');
      }
    } catch (error) {
      console.error('Error saving quotation:', error);
      toast.error('Failed to save quotation');
    }
    setEditingQuotation(null);
  };

  const updateQuotation = async (id, status) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login again');
      return;
    }

    try {
      const response = await quotationAPI.updateStatus(id, status, token);
      if (response.success) {
        await loadData();
        toast.success(`Quotation ${status}`);
      } else {
        toast.error(response.message || 'Failed to update quotation');
      }
    } catch (error) {
      console.error('Error updating quotation:', error);
      toast.error('Failed to update quotation');
    }
  };

  const convertToOrder = async (q) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login again');
      return;
    }

    if (convertingId === q.id) return;
    setConvertingId(q.id);
    try {
      const now = new Date();
      const products = q.products || [{ name: q.droneModel, qty: q.quantity, price: q.unitPrice, total: q.grandTotal }];

      const newOrder = {
        order_number: `ORD-${Date.now().toString().slice(-8)}`,
        quotation_id: q.id,
        customer_id: q.customerId,
        customer_name: q.customerName,
        customer_phone: q.customerPhone || "",
        customer_code: q.customerId || `CUST-${Date.now().toString().slice(-6)}`,
        products: products.map(p => ({
          name: p.name || q.droneModel,
          qty: p.quantity || p.qty || q.quantity,
          price: p.unitPrice || p.price || q.unitPrice,
          total: (p.quantity || p.qty || q.quantity) * (p.unitPrice || p.price || q.unitPrice)
        })),
        total_amount: q.grandTotal,
        status: "ORDER_CREATED",
        delivery_date: new Date(Date.now() + 15 * 864e5).toISOString().split("T")[0],
        created_at: now.toISOString(),
        tracking: {
          status: "ORDER_CREATED",
          lastUpdated: now.toISOString(),
          history: [{
            status: "ORDER_CREATED",
            date: now.toISOString(),
            message: "Order created from quotation"
          }]
        }
      };

      const response = await orderAPI.create(newOrder, token);
      if (response.success) {
        await updateQuotation(q.id, "converted");
        await loadData();
        toast.success('Order created from quotation');
      } else {
        toast.error(response.message || 'Failed to convert to order');
      }
    } catch (error) {
      console.error('Error converting to order:', error);
      toast.error('Failed to convert to order');
    } finally {
      setConvertingId(null);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Please login again');
      return;
    }

    try {
      const response = await orderAPI.updateStatus(orderId, newStatus, token);
      if (response.success) {
        await loadData();
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // ── Profile ──────────────────────────────────────────────────────────────
  const saveProfile = (p) => {
    localStorage.setItem("sales_profile", JSON.stringify(p));
    setProfile(p);
    toast.success('Profile updated successfully');
  };

  // ── Derived Data ─────────────────────────────────────────────────────────
  const allCustomers = getUniqueCustomers([...savedCustomers, ...customers]);
  const pending = quotations.filter(q => q.status === "pending");
  const ongoing = orders.filter(o => !["DELIVERED", "DISPATCHED"].includes(o.status));
  const completed = orders.filter(o => ["DELIVERED", "DISPATCHED"].includes(o.status));
  const approved = quotations.filter(q => q.status === "approved");
  const filtered = quotations.filter(q => {
    const ms = (q.customerName + q.number).toLowerCase().includes(searchTerm.toLowerCase());
    return ms && (statusFilter === "all" || q.status === statusFilter);
  });

  const headerAvatar = profile.avatar;

  // ── Loading Screen ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F0F4F0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔄</div>
          <div style={{ color: '#6B7280' }}>Loading Sales Dashboard...</div>
        </div>
      </div>
    );
  }

  // ── If not authenticated, show login prompt ────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F0F4F0' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '16px', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ margin: '0 0 8px', color: '#1F2937' }}>Authentication Required</h2>
          <p style={{ margin: '0 0 20px', color: '#6B7280' }}>Please login to access the Sales Dashboard</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            style={{ ...css.btn(G[600]), padding: '12px 30px', fontSize: '16px' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div style={{ background: "#F0F4F0", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={css.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: G[600], display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <img src={LOGO} alt="GOAG" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "white" }}>GOAG SERVICES</p>
            <p style={{ margin: 0, fontSize: 10, color: "#A5D6A7" }}>Sales Dashboard</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setShowProfile(true)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: G[500], overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.3)" }}>
              {headerAvatar ? <img src={headerAvatar} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ICONS.user />}
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "white" }}>{profile.name || user?.name || "Sales Manager"}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#A5D6A7" }}>{profile.designation || "SALES MGR"}</p>
            </div>
          </button>
          <button onClick={onLogout} style={{ background: G.red, border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", color: "white", fontSize: 12, fontWeight: 600 }}>Logout</button>
        </div>
      </header>

      {/* Nav */}
      <nav style={css.nav}>
        <div style={{ display: "flex", gap: 0 }}>
          {[["dashboard", "Dashboard", <ICONS.dashboard />], ["quotations", "Quotes", <ICONS.quote />], ["customers", "Customers", <ICONS.users />], ["orders", "Orders", <ICONS.orders />], ["reports", "Reports", <ICONS.reports />]].map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} style={css.navBtn(tab === id)}>
              {icon}<span style={{ display: window.innerWidth < 480 ? "none" : "inline" }}>{label}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal("choose")} style={{ ...css.btn(G[600]), padding: "7px 12px", flexShrink: 0, fontSize: 12 }}>
          <ICONS.plus /><span>New Quote</span>
        </button>
      </nav>

      <main style={{ padding: "16px", maxWidth: 900, margin: "0 auto" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Pending Quotes", value: pending.length, color: G.amber, icon: "⏳" },
                { label: "Ongoing Orders", value: ongoing.length, color: G.blue, icon: "🚚" },
                { label: "Completed", value: completed.length, color: G[500], icon: "✅" },
                { label: "Approved Quotes", value: approved.length, color: G.purple, icon: "📋" },
              ].map(s => (
                <div key={s.label} style={css.statCard(s.color)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: G.gray500 }}>{s.label}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
                    </div>
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: G.gray800, display: "flex", alignItems: "center", gap: 6 }}><ICONS.alert /> Pending ({pending.length})</h3>
                <button onClick={() => setShowModal("choose")} style={{ ...css.btn(G[600]), fontSize: 12, padding: "6px 10px" }}><ICONS.plus /> New</button>
              </div>
              {pending.length === 0 ? <div style={{ background: "white", borderRadius: 12, padding: 30, textAlign: "center", color: G.gray400 }}>No pending quotations</div> : pending.map(q => (
                <div key={q.id} style={css.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{q.number}</span><Badge status={q.status} />
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{q.customerName}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: G.gray500 }}>{q.droneModel} ×{q.quantity}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: G[600] }}>{fmt(q.grandTotal)}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button onClick={() => setShowProforma(q)} style={{ ...css.btn(G[50], G[700]), border: `1px solid ${G[200]}`, fontSize: 12, padding: "6px 10px" }}><ICONS.eye /> View</button>
                    <button onClick={() => generateQuotationPDF(q)} style={{ ...css.btn("#0D1B0F"), fontSize: 12, padding: "6px 10px" }}><ICONS.download /> PDF</button>
                    <button onClick={() => { setEditingQuotation(q); setShowModal("custom"); }} style={{ ...css.btn(G.blue), fontSize: 12, padding: "6px 10px" }}><ICONS.edit /> Edit</button>
                    <button onClick={() => updateQuotation(q.id, "approved")} style={{ ...css.btn(G[600]), fontSize: 12, padding: "6px 10px" }}><ICONS.check /> Approve</button>
                    <button onClick={() => updateQuotation(q.id, "rejected")} style={{ ...css.btn(G.red), fontSize: 12, padding: "6px 10px" }}>✕ Reject</button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: G.gray800 }}>🚚 Ongoing Orders ({ongoing.length})</h3>
              {ongoing.length === 0 ? <div style={{ background: "white", borderRadius: 12, padding: 30, textAlign: "center", color: G.gray400 }}>No ongoing orders</div> : ongoing.map(o => (
                <div key={o.id} style={css.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{o.order_number}</span><Badge status={o.status} />
                      </div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{o.customer_name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: G.gray500 }}>{o.products?.[0]?.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: G.gray400 }}>Delivery: {fmtDate(o.delivery_date)}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(o)} style={{ ...css.btn(G.blue), fontSize: 12, padding: "6px 12px" }}><ICONS.eye /> Track</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUOTATIONS ── */}
        {tab === "quotations" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>All Quotations</h2>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: G.gray400 }}><ICONS.search /></span>
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search quotations…" style={{ ...css.input, paddingLeft: 34 }} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...css.select, width: "auto", minWidth: 120 }}>
                <option value="all">All Status</option>
                {["pending", "approved", "rejected", "converted"].map(s => <option key={s} value={s}>{(STATUS_MAP[s] || {}).label || s}</option>)}
              </select>
            </div>
            {filtered.length === 0 ? <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", color: G.gray400 }}>No quotations found</div> : filtered.map(q => (
              <div key={q.id} style={css.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{q.number}</span>
                  <Badge status={q.status} />
                  <span style={{ fontSize: 11, color: G.gray400 }}>{fmtDate(q.createdDate)}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  <div><p style={{ margin: 0, fontSize: 10, color: G.gray500 }}>Customer</p><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{q.customerName}</p></div>
                  <div><p style={{ margin: 0, fontSize: 10, color: G.gray500 }}>Total</p><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G[600] }}>{fmt(q.grandTotal)}</p></div>
                  <div style={{ gridColumn: "1 / -1" }}><p style={{ margin: 0, fontSize: 10, color: G.gray500 }}>Product</p><p style={{ margin: 0, fontSize: 12, color: G.gray700 }}>{q.droneModel} ×{q.quantity}</p></div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setShowProforma(q)} style={{ ...css.btn(G[50], G[700]), border: `1px solid ${G[200]}`, fontSize: 11, padding: "5px 10px" }}><ICONS.eye /> View</button>
                  <button onClick={() => generateQuotationPDF(q)} style={{ ...css.btn("#0D1B0F"), fontSize: 11, padding: "5px 10px" }}><ICONS.download /> PDF</button>
                  {(q.status === "pending" || q.status === "converted" || q.status === "approved") && (
                    <button onClick={() => { setEditingQuotation(q); setShowModal("custom"); }} style={{ ...css.btn(G.blue), fontSize: 11, padding: "5px 10px" }}><ICONS.edit /> Edit</button>
                  )}
                  {q.status === "pending" && <>
                    <button onClick={() => updateQuotation(q.id, "approved")} style={{ ...css.btn(G[600]), fontSize: 11, padding: "5px 10px" }}>✓ Approve</button>
                    <button onClick={() => updateQuotation(q.id, "rejected")} style={{ ...css.btn(G.red), fontSize: 11, padding: "5px 10px" }}>✕ Reject</button>
                  </>}
                  {q.status === "approved" && (
                    <button onClick={() => convertToOrder(q)} disabled={convertingId === q.id} style={{ ...css.btn(G.purple), fontSize: 11, padding: "5px 10px" }}><ICONS.truck /> Convert to Order</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CUSTOMERS ── */}
        {tab === "customers" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Customers</h2>
              <button onClick={() => { setEditingCustomer(null); setNewCustomer({ name: "", email: "", phone: "", address: "", city: "", district: "", state: "", pincode: "", gst: "" }); setShowCustomerForm(!showCustomerForm); }} style={{ ...css.btn(G[600]) }}>
                <ICONS.userplus /> {showCustomerForm ? 'Cancel' : 'Add'}
              </button>
            </div>

            {showCustomerForm && (
              <form onSubmit={addCustomer} style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 20, border: `1px solid ${G.gray200}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G[600] }}>
                    {editingCustomer ? 'Edit Customer' : 'New Customer'}
                  </p>
                  <span style={{ fontSize: 11, color: G.gray400, background: G[50], padding: "3px 10px", borderRadius: 20 }}>
                    {editingCustomer ? 'Editing' : 'New'}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  {[["name", "Full Name *"], ["phone", "Phone *"], ["email", "Email"], ["address", "Address"], ["city", "City"], ["district", "District"], ["state", "State"], ["pincode", "Pincode"], ["gst", "GST (optional)"]].map(([f, l]) => (
                    <div key={f} style={{ gridColumn: f === "address" ? "1 / -1" : "auto" }}>
                      <label style={css.label}>{l}</label>
                      <input 
                        value={newCustomer[f] || ""} 
                        onChange={(e) => setNewCustomer({ ...newCustomer, [f]: e.target.value })} 
                        style={css.input} 
                        required={f === "name" || f === "phone"} 
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={() => { setShowCustomerForm(false); setEditingCustomer(null); }} style={{ ...css.btn(G.gray100, G.gray700), flex: 1, justifyContent: "center" }}>Cancel</button>
                  <button type="submit" style={{ ...css.btn(G[600]), flex: 1, justifyContent: "center" }}>
                    <ICONS.save /> {editingCustomer ? 'Update Customer' : 'Save Customer'}
                  </button>
                </div>
              </form>
            )}

            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: G[600] }}>✓ Customers ({savedCustomers.length})</p>
              {savedCustomers.length === 0 ? (
                <div style={{ background: "white", borderRadius: 12, padding: 24, textAlign: "center", color: G.gray400, border: `2px dashed ${G.gray200}`, fontSize: 13 }}>No customers yet</div>
              ) : (
                savedCustomers.map((c, index) => (
                  <div key={c.id || c.email || index} style={{ ...css.card, cursor: "pointer" }} onClick={() => setSelectedCustomer(c)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: G.gray800 }}>{c.name}</p>
                        <p style={{ margin: "2px 0", fontSize: 12, color: G.gray500 }}>{c.phone} · {c.city || 'N/A'}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ ...css.badge(G[50], G[700]), border: `1px solid ${G[200]}` }}>{c.customerCode}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleEditCustomer(c); }} style={{ ...css.btn(G.blue), fontSize: 11, padding: "4px 8px" }}><ICONS.edit /></button>
                        <button onClick={(e) => { e.stopPropagation(); if (c.email) deleteCustomer(c.email); }} style={{ ...css.btn(G.red), fontSize: 11, padding: "4px 8px" }}><ICONS.trash /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Production Orders</h2>
            {orders.length === 0 ? (
              <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", color: G.gray400 }}>No orders yet. Convert approved quotations to orders.</div>
            ) : orders.map(o => (
              <div key={o.id} style={css.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{o.order_number}</span><Badge status={o.status} />
                    </div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{o.customer_name}</p>
                    <p style={{ margin: "2px 0", fontSize: 12, color: G.gray500 }}>{o.products?.[0]?.name} ×{o.products?.[0]?.qty}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: G[600] }}>{fmt(o.total_amount)}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: G.gray400 }}>Delivery: {fmtDate(o.delivery_date)}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(o)} style={{ ...css.btn(G.blue), fontSize: 12, padding: "7px 12px" }}><ICONS.eye /> Track</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab === "reports" && <ReportsTab quotations={quotations} orders={orders} />}
      </main>

      {/* ── Modals ── */}
      {showModal === "choose" && (
        <div style={css.modal} onClick={(e) => e.target === e.currentTarget && setShowModal(null)}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 500, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>New Quotation</h3>
              <button onClick={() => setShowModal(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><ICONS.x /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button onClick={() => setShowModal("prefilled")} style={{ padding: 18, background: G[50], border: `2px solid ${G[200]}`, borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: G[700] }}>📦 Prefilled Quotation</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: G.gray500 }}>Select from available drone models</p>
              </button>
              <button onClick={() => { setEditingQuotation(null); setShowModal("custom"); }} style={{ padding: 18, background: "#FFFBEB", border: "2px solid #FCD34D", borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#92400E" }}>⚙️ Custom Quotation</p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: G.gray500 }}>Fully editable with multiple products and add-ons</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <PrefilledModal
        isOpen={showModal === "prefilled"}
        onClose={() => setShowModal(null)}
        onSave={(q) => { saveQuotation(q); setShowModal(null); }}
        customers={allCustomers}
        droneModels={droneModels}
      />

      <QuotationEditModal
        isOpen={showModal === "custom"}
        onClose={() => { setShowModal(null); setEditingQuotation(null); }}
        onSave={saveQuotation}
        customers={allCustomers}
        initial={editingQuotation}
      />

      <ProformaModal quotation={showProforma} onClose={() => setShowProforma(null)} />

      <OrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={updateOrderStatus}
        quotations={quotations}
        onEditQuotation={(q) => { setEditingQuotation(q); setShowModal("custom"); }}
      />

      <CustomerModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onEdit={editCustomer}
        orders={orders}
        quotations={quotations}
      />

      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        profile={profile}
        onSave={saveProfile}
      />
    </div>
  );
}