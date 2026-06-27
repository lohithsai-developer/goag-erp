import { useState, useEffect } from 'react';
import axios from 'axios';
import QuotationTemplate from './QuotationTemplate';

const LOGO = "data:image/png;base64,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";

export default function SalesManagerUI({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState('quotations');
    const [customers, setCustomers] = useState([]);
    const [droneModels, setDroneModels] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showQuotationType, setShowQuotationType] = useState(null);
    const [showQuotationTemplate, setShowQuotationTemplate] = useState(null);
    const [editingQuotation, setEditingQuotation] = useState(null);
    
    // Customer form states
    const [newCustomer, setNewCustomer] = useState({ 
        name: '', email: '', phone: '', 
        address: '', city: '', district: '', state: '', pincode: '', gst: '' 
    });
    
    // Pre-filled quotation states
    const [prefilledQuotation, setPrefilledQuotation] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        droneModelId: '',
        quantity: 1
    });
    
    // Custom quotation states
    const [customQuotation, setCustomQuotation] = useState({
        customerId: '',
        customerName: '',
        customerPhone: '',
        droneModel: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        shipping: 0,
        taxRate: 18
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [customersRes, dronesRes, quotationsRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/sales/customers'),
                axios.get('http://localhost:5000/api/sales/drone-models'),
                axios.get('http://localhost:5000/api/sales/quotations'),
                axios.get('http://localhost:5000/api/sales/orders')
            ]);
            setCustomers(customersRes.data.customers);
            setDroneModels(dronesRes.data.drones);
            setQuotations(quotationsRes.data.quotations);
            setOrders(ordersRes.data.orders);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/sales/customers/add', newCustomer);
            alert('Customer added successfully!');
            setShowCustomerForm(false);
            setNewCustomer({ name: '', email: '', phone: '', address: '', city: '', district: '', state: '', pincode: '', gst: '' });
            fetchData();
        } catch (error) {
            alert('Error adding customer');
        }
    };

    const handleCreatePrefilledQuotation = async (e) => {
        e.preventDefault();
        const selectedDrone = droneModels.find(d => d.id === parseInt(prefilledQuotation.droneModelId));
        if (!selectedDrone) {
            alert('Please select a drone model');
            return;
        }
        
        const total = prefilledQuotation.quantity * selectedDrone.price;
        const tax = total * (selectedDrone.taxRate / 100);
        const grandTotal = total + tax;
        
        try {
            const response = await axios.post('http://localhost:5000/api/sales/quotation/prefilled/create', {
                customerId: prefilledQuotation.customerId,
                customerName: prefilledQuotation.customerName,
                customerPhone: prefilledQuotation.customerPhone,
                droneModelId: prefilledQuotation.droneModelId,
                quantity: prefilledQuotation.quantity,
                unitPrice: selectedDrone.price,
                total,
                tax,
                grandTotal,
                taxRate: selectedDrone.taxRate
            });
            alert('Quotation created successfully!');
            setShowQuotationType(null);
            setPrefilledQuotation({ customerId: '', customerName: '', customerPhone: '', droneModelId: '', quantity: 1 });
            fetchData();
        } catch (error) {
            alert('Error creating quotation');
        }
    };

    const handleCreateCustomQuotation = async (e) => {
        e.preventDefault();
        const subtotal = customQuotation.quantity * customQuotation.unitPrice;
        const discountAmount = subtotal * (customQuotation.discount / 100);
        const afterDiscount = subtotal - discountAmount;
        const tax = afterDiscount * (customQuotation.taxRate / 100);
        const grandTotal = afterDiscount + tax + (customQuotation.shipping || 0);
        
        try {
            await axios.post('http://localhost:5000/api/sales/quotation/custom/create', {
                ...customQuotation,
                total: subtotal,
                tax,
                grandTotal
            });
            alert('Custom quotation created!');
            setShowQuotationType(null);
            setCustomQuotation({ customerId: '', customerName: '', customerPhone: '', droneModel: '', quantity: 1, unitPrice: 0, discount: 0, shipping: 0, taxRate: 18 });
            fetchData();
        } catch (error) {
            alert('Error creating quotation');
        }
    };

    const updateQuotationStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/sales/quotations/${id}/status`, { status });
            alert(`Quotation ${status}`);
            fetchData();
        } catch (error) {
            alert('Error updating quotation');
        }
    };

    const convertToOrder = async (id) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/sales/quotations/${id}/convert-to-order`);
            alert(response.data.message);
            fetchData();
        } catch (error) {
            alert('Error converting to order');
        }
    };

    const handleEditQuotation = (quotation) => {
        // Open the full QuotationTemplate for editing
        setShowQuotationTemplate(quotation);
    };

    const handleSaveQuotation = async (quotationData) => {
        try {
            if (quotationData.id) {
                // Update existing
                await axios.put(`http://localhost:5000/api/sales/quotation/${quotationData.id}`, quotationData);
                alert('Quotation updated successfully!');
            } else {
                // Create new
                await axios.post('http://localhost:5000/api/sales/quotations/create`, quotationData);
                alert('Quotation created successfully!');
            }
            fetchData();
        } catch (error) {
            console.error('Error saving quotation:', error);
            alert('Error saving quotation');
        }
    };

    const generateQuotationMessage = (quotation) => {
        let message = `*🚁 GOAG SERVICES PRIVATE LIMITED*\n`;
        message += `Address: Plot No:72/P, 3rd Floor Rajiv Gandhi Nagar, Kukatpally, Hyderabad - 500072\n`;
        message += `GST: 36AALCG4043K12E\n\n`;
        message += `*QUOTATION*\n`;
        message += `Date: ${new Date(quotation.date || quotation.createdDate).toLocaleDateString('en-IN')}\n`;
        message += `Q.No.: ${quotation.number}\n`;
        message += `Customer: ${quotation.customerName}\n`;
        message += `Phone: ${quotation.customerPhone}\n\n`;
        message += `*Product Details:*\n`;
        message += `┌─────────────────┬──────────┬─────────┬───────┬──────────┐\n`;
        message += `│ Product         │ Qty      │ Price   │ GST%  │ Total    │\n`;
        message += `├─────────────────┼──────────┼─────────┼───────┼──────────┤\n`;
        
        const products = quotation.products || [{ name: quotation.droneModel, quantity: quotation.quantity, price: quotation.unitPrice, gst: quotation.taxRate || 18, total: quotation.total }];
        products.forEach(p => {
            const name = (p.name || p.droneModel || '').substring(0, 15);
            message += `│ ${name.padEnd(15)} │ ${String(p.quantity || 0).padEnd(8)} │ ${String(p.price || p.unitPrice || 0).padEnd(7)} │ ${String(p.gst || 18).padEnd(5)} │ ${(p.total || 0).toLocaleString().padEnd(8)} │\n`;
        });
        
        message += `└─────────────────┴──────────┴─────────┴───────┴──────────┘\n`;
        message += `Subtotal: ₹${(quotation.subtotal || quotation.total || 0).toLocaleString()}\n`;
        message += `GST (18%): ₹${(quotation.tax || 0).toLocaleString()}\n`;
        message += `*Grand Total: ₹${(quotation.grandTotal || 0).toLocaleString()}*\n\n`;
        message += `Amount in words: ${quotation.amountInWords || 'Rupees Only'}\n\n`;
        message += `Bank Details:\n`;
        const bank = quotation.bankDetails || { bankName: 'GOAG SERVICES PRIVATE LIMITED', accountNumber: '10214675116', ifscCode: 'IDFB****222', branch: 'Hitech City' };
        message += `Account: ${bank.bankName}\n`;
        message += `A/c No: ${bank.accountNumber}\n`;
        message += `IFSC: ${bank.ifscCode}\n`;
        message += `Branch: ${bank.branch}\n\n`;
        message += `Terms & Conditions apply.\n`;
        message += `Thank you for choosing GOAG Drones! 🚁`;
        
        return message;
    };

    const sendViaWhatsApp = async (quotation) => {
        try {
            // Fetch full quotation if needed
            let fullQuotation = quotation;
            if (!quotation.products) {
                const response = await axios.get(`http://localhost:5000/api/sales/quotation/${quotation.id}`);
                fullQuotation = response.data.quotation;
            }
            const message = generateQuotationMessage(fullQuotation);
            const whatsappUrl = `https://wa.me/91${fullQuotation.customerPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } catch (error) {
            alert('Error sending WhatsApp message: ' + error.message);
        }
    };

    return (
        <div style={{ background: '#F3F4F6', minHeight: '100vh', fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif" }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #065F46 0%, #047857 100%)', color: 'white', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={LOGO} alt="GOAG" style={{ width: '48px', height: '48px', borderRadius: '12px' }} />
                    <div>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>GOAG DRONES & SERVICES</h1>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.85 }}>Sales Manager Dashboard</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{user?.name}</p>
                    <button onClick={onLogout} style={{ marginTop: '6px', padding: '6px 14px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Logout</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', padding: '0 24px', borderBottom: '1px solid #E5E7EB', background: 'white' }}>
                <button onClick={() => { setActiveTab('quotations'); setShowQuotationType(null); setShowQuotationTemplate(null); }} style={{ padding: '14px 24px', background: activeTab === 'quotations' ? '#065F46' : 'transparent', color: activeTab === 'quotations' ? 'white' : '#4B5563', border: 'none', borderRadius: '12px 12px 0 0', cursor: 'pointer', fontWeight: '500' }}>📋 Quotations</button>
                <button onClick={() => { setActiveTab('customers'); setShowQuotationType(null); setShowQuotationTemplate(null); }} style={{ padding: '14px 24px', background: activeTab === 'customers' ? '#065F46' : 'transparent', color: activeTab === 'customers' ? 'white' : '#4B5563', border: 'none', borderRadius: '12px 12px 0 0', cursor: 'pointer', fontWeight: '500' }}>👥 Customers</button>
                <button onClick={() => { setActiveTab('orders'); setShowQuotationType(null); setShowQuotationTemplate(null); }} style={{ padding: '14px 24px', background: activeTab === 'orders' ? '#065F46' : 'transparent', color: activeTab === 'orders' ? 'white' : '#4B5563', border: 'none', borderRadius: '12px 12px 0 0', cursor: 'pointer', fontWeight: '500' }}>📦 Orders</button>
                <button onClick={() => setShowQuotationType('choose')} style={{ padding: '14px 24px', background: '#065F46', color: 'white', border: 'none', borderRadius: '12px 12px 0 0', cursor: 'pointer', fontWeight: '500' }}>➕ New Quotation</button>
                <button onClick={() => setShowQuotationTemplate({})} style={{ padding: '14px 24px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '12px 12px 0 0', cursor: 'pointer', fontWeight: '500' }}>📄 Full Template</button>
            </div>

            <div style={{ padding: '24px' }}>
                {/* Quotation Type Selection */}
                {showQuotationType === 'choose' && (
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', justifyContent: 'center' }}>
                        <button onClick={() => setShowQuotationType('prefilled')} style={{ padding: '24px', background: 'white', borderRadius: '16px', cursor: 'pointer', flex: 1, maxWidth: '280px', border: '2px solid #065F46', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#065F46' }}>Pre-filled Quotation</div>
                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Quick quote with standard prices</div>
                        </button>
                        <button onClick={() => setShowQuotationType('custom')} style={{ padding: '24px', background: 'white', borderRadius: '16px', cursor: 'pointer', flex: 1, maxWidth: '280px', border: '2px solid #F59E0B', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️</div>
                            <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#F59E0B' }}>Custom Quotation</div>
                            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Full control over pricing</div>
                        </button>
                    </div>
                )}

                {/* Pre-filled Quotation Form */}
                {showQuotationType === 'prefilled' && (
                    <form onSubmit={handleCreatePrefilledQuotation} style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, color: '#065F46' }}>🚀 Create Pre-filled Quotation</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Customer *</label>
                            <select value={prefilledQuotation.customerId} onChange={(e) => {
                                const customer = customers.find(c => c.id === parseInt(e.target.value));
                                setPrefilledQuotation({ ...prefilledQuotation, customerId: e.target.value, customerName: customer?.name || '', customerPhone: customer?.phone || '' });
                            }} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Drone Model *</label>
                            <select value={prefilledQuotation.droneModelId} onChange={(e) => setPrefilledQuotation({ ...prefilledQuotation, droneModelId: e.target.value })} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                                <option value="">Select Drone</option>
                                {droneModels.map(d => <option key={d.id} value={d.id}>{d.name} - ₹{d.price.toLocaleString()}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Quantity *</label>
                            <input type="number" min="1" value={prefilledQuotation.quantity} onChange={(e) => setPrefilledQuotation({ ...prefilledQuotation, quantity: parseInt(e.target.value) })} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '14px', background: '#065F46', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Create Quotation</button>
                    </form>
                )}

                {/* Custom Quotation Form */}
                {showQuotationType === 'custom' && (
                    <form onSubmit={handleCreateCustomQuotation} style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '700px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, color: '#F59E0B' }}>⚙️ Create Custom Quotation</h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Select Customer *</label>
                            <select value={customQuotation.customerId} onChange={(e) => {
                                const customer = customers.find(c => c.id === parseInt(e.target.value));
                                setCustomQuotation({ ...customQuotation, customerId: e.target.value, customerName: customer?.name || '', customerPhone: customer?.phone || '' });
                            }} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }}>
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Product/Drone Name *</label>
                            <input type="text" value={customQuotation.droneModel} onChange={(e) => setCustomQuotation({ ...customQuotation, droneModel: e.target.value })} required placeholder="e.g., GOAG AgriSpray X1" style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Quantity *</label>
                                <input type="number" min="1" value={customQuotation.quantity} onChange={(e) => setCustomQuotation({ ...customQuotation, quantity: parseInt(e.target.value) })} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Unit Price (₹) *</label>
                                <input type="number" value={customQuotation.unitPrice} onChange={(e) => setCustomQuotation({ ...customQuotation, unitPrice: parseInt(e.target.value) })} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Discount (%)</label>
                                <input type="number" value={customQuotation.discount} onChange={(e) => setCustomQuotation({ ...customQuotation, discount: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Shipping (₹)</label>
                                <input type="number" value={customQuotation.shipping} onChange={(e) => setCustomQuotation({ ...customQuotation, shipping: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Tax Rate (%)</label>
                                <input type="number" value={customQuotation.taxRate} onChange={(e) => setCustomQuotation({ ...customQuotation, taxRate: parseInt(e.target.value) })} required style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', padding: '16px', background: '#F3F4F6', borderRadius: '12px' }}>
                            <h4 style={{ margin: '0 0 12px', fontSize: '14px' }}>Amount Summary</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Subtotal:</span>
                                <span>₹{(customQuotation.quantity * customQuotation.unitPrice).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Discount:</span>
                                <span>₹{((customQuotation.quantity * customQuotation.unitPrice) * customQuotation.discount / 100).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span>Tax ({customQuotation.taxRate}%):</span>
                                <span>₹{(((customQuotation.quantity * customQuotation.unitPrice) - ((customQuotation.quantity * customQuotation.unitPrice) * customQuotation.discount / 100)) * customQuotation.taxRate / 100).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E5E7EB', fontWeight: 'bold', fontSize: '16px' }}>
                                <span>Grand Total:</span>
                                <span style={{ color: '#065F46' }}>₹{((customQuotation.quantity * customQuotation.unitPrice) - ((customQuotation.quantity * customQuotation.unitPrice) * customQuotation.discount / 100) + ((customQuotation.quantity * customQuotation.unitPrice - (customQuotation.quantity * customQuotation.unitPrice) * customQuotation.discount / 100) * customQuotation.taxRate / 100) + (customQuotation.shipping || 0)).toLocaleString()}</span>
                            </div>
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '14px', marginTop: '20px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Create Quotation</button>
                    </form>
                )}

                {/* Quotations List */}
                {activeTab === 'quotations' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1F2937' }}>All Quotations</h3>
                        {quotations.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>No quotations found</div>
                        ) : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {quotations.map(q => (
                                    <div key={q.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1F2937' }}>{q.number}</span>
                                                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', background: q.status === 'approved' ? '#10B981' : q.status === 'rejected' ? '#EF4444' : '#F59E0B', color: 'white' }}>{q.status?.toUpperCase()}</span>
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#4B5563' }}>{q.customerName}</div>
                                                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{q.droneModel} × {q.quantity}</div>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#065F46', marginTop: '8px' }}>₹{q.grandTotal?.toLocaleString()}</div>
                                                {q.orderNumber && <div style={{ fontSize: '12px', color: '#10B981', marginTop: '4px' }}>Order: {q.orderNumber}</div>}
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                                <button onClick={() => handleEditQuotation(q)} style={{ padding: '8px 16px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit</button>
                                                <button onClick={() => sendViaWhatsApp(q)} style={{ padding: '8px 16px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>📱 WhatsApp</button>
                                                {q.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => updateQuotationStatus(q.id, 'approved')} style={{ padding: '8px 16px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>✓ Approve</button>
                                                        <button onClick={() => updateQuotationStatus(q.id, 'rejected')} style={{ padding: '8px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>✗ Reject</button>
                                                    </>
                                                )}
                                                {q.status === 'approved' && !q.orderNumber && (
                                                    <button onClick={() => convertToOrder(q.id)} style={{ padding: '8px 16px', background: '#065F46', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>📦 Send to Production</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Customers List */}
                {activeTab === 'customers' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <h3 style={{ margin: 0 }}>Customer Database</h3>
                            <button onClick={() => setShowCustomerForm(!showCustomerForm)} style={{ padding: '10px 20px', background: '#065F46', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' }}>+ Add Customer</button>
                        </div>

                        {showCustomerForm && (
                            <form onSubmit={handleAddCustomer} style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                                <h4>New Customer</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                    <input type="text" placeholder="Full Name *" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} required style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="email" placeholder="Email (Optional)" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="tel" placeholder="Phone *" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} required style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="text" placeholder="Address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} required style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="text" placeholder="City" value={newCustomer.city} onChange={(e) => setNewCustomer({...newCustomer, city: e.target.value})} required style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="text" placeholder="District" value={newCustomer.district} onChange={(e) => setNewCustomer({...newCustomer, district: e.target.value})} required style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="text" placeholder="State" value={newCustomer.state} onChange={(e) => setNewCustomer({...newCustomer, state: e.target.value})} required style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="text" placeholder="Pincode" value={newCustomer.pincode} onChange={(e) => setNewCustomer({...newCustomer, pincode: e.target.value})} required style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                    <input type="text" placeholder="GST (Optional)" value={newCustomer.gst} onChange={(e) => setNewCustomer({...newCustomer, gst: e.target.value})} style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '10px' }} />
                                </div>
                                <button type="submit" style={{ marginTop: '20px', padding: '12px 24px', background: '#065F46', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' }}>Save Customer</button>
                            </form>
                        )}

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {customers.map(c => (
                                <div key={c.id} style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1F2937' }}>{c.name}</div>
                                            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{c.email || 'No email'} | {c.phone}</div>
                                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{c.address}, {c.city}, {c.district}, {c.state} - {c.pincode}</div>
                                            {c.gst && <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>GST: {c.gst}</div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders List */}
                {activeTab === 'orders' && (
                    <div>
                        <h3 style={{ marginBottom: '20px', color: '#1F2937' }}>Production Orders</h3>
                        {orders.length === 0 ? (
                            <div style={{ background: 'white', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>No orders yet</div>
                        ) : (
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {orders.map(o => (
                                    <div key={o.id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1F2937' }}>{o.orderNumber}</div>
                                                <div style={{ fontSize: '13px', color: '#065F46', fontWeight: '500', marginTop: '4px' }}>Customer ID: {o.customerId}</div>
                                                <div style={{ fontSize: '14px', marginTop: '4px' }}>{o.customerName}</div>
                                                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>{o.droneModel} × {o.quantity}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#065F46' }}>₹{o.totalAmount?.toLocaleString()}</div>
                                                <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', background: o.status === 'completed' ? '#10B981' : '#F59E0B', color: 'white', marginTop: '8px' }}>{o.status}</span>
                                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>Expected: {o.expectedDelivery}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quotation Template Modal */}
            {showQuotationTemplate && (
                <QuotationTemplate 
                    quotation={showQuotationTemplate} 
                    onClose={() => setShowQuotationTemplate(null)} 
                    onUpdate={handleSaveQuotation}
                />
            )}
        </div>
    );
}