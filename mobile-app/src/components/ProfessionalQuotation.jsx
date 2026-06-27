import { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, RefreshCw, Plus, Trash2, Send, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfessionalQuotation = ({ quotation, onClose, onSave }) => {
    const quotationRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [companyDetails, setCompanyDetails] = useState({
        name: 'GOAG SERVICES PRIVATE LIMITED',
        tagline: 'Drone Technology & Agricultural Solutions',
        address: 'Plot No:72/P, 3rd Floor Rajiv Gandhi Nagar, Kukatpally, Hyderabad - 500072',
        phone: '+91 799 555 5555 | +91 797 555 5554',
        email: 'info@goagservices.com',
        gst: '36AAALCG4043K12E'
    });
    const [customerDetails, setCustomerDetails] = useState({
        name: '',
        address: '',
        gst: '',
        phone: ''
    });
    const [quotationDetails, setQuotationDetails] = useState({
        number: `GOAG-PI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        validTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'PENDING'
    });
    const [bankDetails, setBankDetails] = useState({
        accountName: 'GOAG SERVICES PRIVATE LIMITED',
        accountNumber: '10214675116',
        ifsc: 'IDFB0080222',
        branch: 'Hitech City, Hyderabad'
    });
    const [terms, setTerms] = useState([
        'All prices are inclusive of all taxes and duties applicable.',
        'Payment is due within 15 days of invoice date.',
        'Delivery timeline: 7-10 business days after payment confirmation.',
        'Warranty: 1 year on manufacturing defects (batteries: 6 months).'
    ]);

    // Pre-defined add-ons
    const addOns = [
        { name: 'Extra Battery Set', price: 36500, gst: 18, icon: '🔋' },
        { name: 'Propeller Set (4 pcs)', price: 8500, gst: 18, icon: '🔄' },
        { name: 'Carrying Case', price: 12500, gst: 18, icon: '🧳' },
        { name: 'Extended Warranty (2 years)', price: 25000, gst: 18, icon: '📜' },
        { name: 'Spare Parts Kit', price: 15000, gst: 18, icon: '🔧' },
        { name: 'Fast Charger', price: 3500, gst: 18, icon: '⚡' }
    ];

    useEffect(() => {
        if (quotation) {
            setCustomerDetails({
                name: quotation.customerName || '',
                address: quotation.customerAddress || '',
                gst: quotation.customerGst || '',
                phone: quotation.customerPhone || ''
            });
            setQuotationDetails({
                ...quotationDetails,
                number: quotation.number || quotationDetails.number
            });
        }
        initializeProducts();
    }, [quotation]);

    const initializeProducts = () => {
        const defaultProducts = [
            { id: 1, name: 'AGRIFLOX® CROPS FERTIGINATE™', description: '10L Agricultural Spraying Drone (Including 1 set 22000 mAh)', quantity: 1, price: 321300, gst: 5, total: 321300 },
            { id: 2, name: 'Charger', description: 'Sky RC 1080w Charger', quantity: 1, price: 17000, gst: 18, total: 17000 },
            { id: 3, name: 'Bike Mount Frame', description: 'Bike mount frame', quantity: 1, price: 17500, gst: 18, total: 17500 },
            { id: 4, name: 'Battery', description: 'Made in India 65 30000 mah battery set', quantity: 4, price: 36500, gst: 18, total: 146000 }
        ];
        setProducts(defaultProducts);
    };

    const updateProduct = (id, field, value) => {
        setProducts(prev => prev.map(p => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    updated.total = updated.quantity * updated.price;
                }
                return updated;
            }
            return p;
        }));
    };

    const addProduct = () => {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        setProducts([...products, {
            id: newId,
            name: 'New Product',
            description: 'Enter description',
            quantity: 1,
            price: 0,
            gst: 18,
            total: 0
        }]);
    };

    const removeProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    const addAddon = (addon) => {
        const newId = Math.max(...products.map(p => p.id), 0) + 1;
        setProducts([...products, {
            id: newId,
            name: addon.name,
            description: 'Add-on item',
            quantity: 1,
            price: addon.price,
            gst: addon.gst,
            total: addon.price
        }]);
        toast.success(`Added ${addon.name}`);
    };

    const calculateSubtotal = () => {
        return products.reduce((sum, p) => sum + (p.total || 0), 0);
    };

    const calculateGSTByRate = (rate) => {
        return products
            .filter(p => p.gst === rate)
            .reduce((sum, p) => sum + ((p.total || 0) * p.gst / 100), 0);
    };

    const calculateGrandTotal = () => {
        const subtotal = calculateSubtotal();
        const gst5 = calculateGSTByRate(5);
        const gst12 = calculateGSTByRate(12);
        const gst18 = calculateGSTByRate(18);
        return subtotal + gst5 + gst12 + gst18;
    };

    const numberToWords = (num) => {
        if (num === 0) return 'Zero';
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        const convert = (n) => {
            if (n < 20) return ones[n];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
            if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
            if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
            return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
        };
        
        return convert(num) + ' Rupees Only';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const generatePDF = async () => {
        setLoading(true);
        const element = quotationRef.current;
        
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            });
            
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Quotation_${quotationDetails.number}.pdf`);
            
            toast.success('PDF downloaded successfully!');
        } catch (error) {
            toast.error('Error generating PDF');
        }
        setLoading(false);
    };

    const sendViaWhatsApp = async () => {
        setLoading(true);
        const element = quotationRef.current;
        
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait'
            });
            
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            const pdfBlob = pdf.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `Quotation_${quotationDetails.number}.pdf`;
            link.click();
            
            const phone = customerDetails.phone?.replace(/\D/g, '');
            if (phone && phone.length >= 10) {
                const finalPhone = phone.length === 10 ? '91' + phone : phone;
                const message = `*🚁 GOAG SERVICES PRIVATE LIMITED*\n` +
                    `*QUOTATION* ${quotationDetails.number}\n` +
                    `*Customer:* ${customerDetails.name}\n` +
                    `*Amount:* ${formatCurrency(calculateGrandTotal())}\n\n` +
                    `📎 *PDF Attached* - Please find your detailed quotation.\n\n` +
                    `Thank you for choosing GOAG Drones! 🚁`;
                
                const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }
            
            setTimeout(() => URL.revokeObjectURL(pdfUrl), 5000);
            toast.success('PDF generated! Share via WhatsApp');
        } catch (error) {
            toast.error('Error generating PDF');
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const quotationData = {
            number: quotationDetails.number,
            date: quotationDetails.date,
            validTill: quotationDetails.validTill,
            customerName: customerDetails.name,
            customerAddress: customerDetails.address,
            customerGst: customerDetails.gst,
            customerPhone: customerDetails.phone,
            products: products,
            subtotal: calculateSubtotal(),
            gst5: calculateGSTByRate(5),
            gst12: calculateGSTByRate(12),
            gst18: calculateGSTByRate(18),
            grandTotal: calculateGrandTotal(),
            amountInWords: numberToWords(calculateGrandTotal()),
            bankDetails: bankDetails,
            terms: terms
        };
        
        if (onSave) {
            await onSave(quotationData);
        }
        onClose();
    };

    const subtotal = calculateSubtotal();
    const gst5 = calculateGSTByRate(5);
    const gst12 = calculateGSTByRate(12);
    const gst18 = calculateGSTByRate(18);
    const grandTotal = calculateGrandTotal();

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, overflow: 'auto', padding: '20px'
        }}>
            <div style={{
                maxWidth: '1200px', width: '100%', maxHeight: '90vh',
                overflow: 'auto', background: 'white', borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
                {/* Quotation Content */}
                <div ref={quotationRef} style={{ background: 'white', padding: '30px' }}>
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1a237e 0%, #0d1b5e 100%)',
                        color: 'white', padding: '30px', borderRadius: '12px',
                        marginBottom: '20px', position: 'relative'
                    }}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                            {companyDetails.name}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '15px' }}>
                            {companyDetails.tagline}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8 }}>
                            {companyDetails.address}<br/>
                            Ph: {companyDetails.phone} | Email: {companyDetails.email}<br/>
                            GST: {companyDetails.gst}
                        </div>
                        <div style={{ position: 'absolute', top: 30, right: 30, textAlign: 'right' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '50px', fontSize: '12px', fontWeight: 'bold' }}>
                                PROFORMA INVOICE
                            </div>
                        </div>
                    </div>

                    {/* Customer & Quote Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>BILLING TO</div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{customerDetails.name || 'Customer Name'}</div>
                            <div style={{ fontSize: '12px', color: '#555' }}>{customerDetails.address || 'Customer Address'}</div>
                            <div style={{ fontSize: '12px', color: '#555' }}>GST: {customerDetails.gst || 'N/A'}</div>
                            <div style={{ fontSize: '12px', color: '#555' }}>Phone: {customerDetails.phone || 'N/A'}</div>
                        </div>
                        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>QUOTE DETAILS</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e' }}>{quotationDetails.number}</div>
                            <div style={{ fontSize: '12px', marginTop: '8px' }}>Date: {quotationDetails.date}</div>
                            <div style={{ fontSize: '12px' }}>Valid Till: {quotationDetails.validTill}</div>
                            <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                Status: <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{quotationDetails.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: '#1a237e', color: 'white' }}>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '50px' }}>S.No</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Product Name</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '70px' }}>Qty</th>
                                    <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Unit Price</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>GST%</th>
                                    <th style={{ padding: '12px', textAlign: 'right', width: '100px' }}>Total</th>
                                    <th style={{ padding: '12px', textAlign: 'center', width: '40px' }}></th>
                                 </tr>
                            </thead>
                            <tbody>
                                {products.map((product, index) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ padding: '10px' }}>
                                            <input type="text" value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} style={{ width: '100%', border: 'none', background: '#fffef7', padding: '5px', borderRadius: '4px' }} />
                                        </td>
                                        <td style={{ padding: '10px' }}>
                                            <input type="text" value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} style={{ width: '100%', border: 'none', background: '#fffef7', padding: '5px', borderRadius: '4px' }} />
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <input type="number" value={product.quantity} onChange={(e) => updateProduct(product.id, 'quantity', parseInt(e.target.value) || 0)} style={{ width: '60px', textAlign: 'center', border: 'none', background: '#fffef7', padding: '5px', borderRadius: '4px' }} />
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>
                                            <input type="number" value={product.price} onChange={(e) => updateProduct(product.id, 'price', parseInt(e.target.value) || 0)} style={{ width: '100px', textAlign: 'right', border: 'none', background: '#fffef7', padding: '5px', borderRadius: '4px' }} />
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <input type="number" value={product.gst} onChange={(e) => updateProduct(product.id, 'gst', parseInt(e.target.value) || 0)} style={{ width: '50px', textAlign: 'center', border: 'none', background: '#fffef7', padding: '5px', borderRadius: '4px' }} />
                                        </td>
                                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>₹{product.total.toLocaleString()}</td>
                                        <td style={{ padding: '10px', textAlign: 'center' }}>
                                            <button onClick={() => removeProduct(product.id)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>×</button>
                                        </td>
                                     </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>

                    {/* Add Product Button */}
                    <button onClick={addProduct} style={{ marginBottom: '20px', padding: '8px 16px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Plus size={16} /> Add Product
                    </button>

                    {/* Quick Add-ons */}
                    <div style={{ background: '#f0f4ff', borderRadius: '12px', padding: '15px', marginBottom: '20px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1a237e' }}>⚡ Quick Add-ons</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {addOns.map((addon, idx) => (
                                <button key={idx} onClick={() => addAddon(addon)} style={{ background: 'white', border: '1px solid #1a237e', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{addon.icon}</span> {addon.name} - ₹{addon.price.toLocaleString()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                        <div style={{ width: '350px', background: '#f8f9fa', borderRadius: '12px', padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Subtotal:</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>
                            {gst5 > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                    <span>GST (5%):</span>
                                    <span>₹{gst5.toLocaleString()}</span>
                                </div>
                            )}
                            {gst12 > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                    <span>GST (12%):</span>
                                    <span>₹{gst12.toLocaleString()}</span>
                                </div>
                            )}
                            {gst18 > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                    <span>GST (18%):</span>
                                    <span>₹{gst18.toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #1a237e', fontWeight: 'bold', fontSize: '18px', color: '#1a237e' }}>
                                <span>Grand Total:</span>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                            <div style={{ marginTop: '12px', fontSize: '11px', color: '#666' }}>
                                <strong>In Words:</strong> {numberToWords(grandTotal)}
                            </div>
                        </div>
                    </div>

                    {/* Bank Details */}
                    <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#1a237e' }}>Bank Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                            <div><strong>Account Name:</strong><br/>{bankDetails.accountName}</div>
                            <div><strong>Account Number:</strong><br/>{bankDetails.accountNumber}</div>
                            <div><strong>IFSC Code:</strong><br/>{bankDetails.ifsc}</div>
                            <div><strong>Branch:</strong><br/>{bankDetails.branch}</div>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '20px' }}>
                        <strong>Terms & Conditions:</strong>
                        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                            {terms.map((term, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{term}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Signature */}
                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
                        <div>
                            <strong>For GOAG SERVICES PRIVATE LIMITED</strong>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '30px', width: '200px', borderBottom: '1px solid #000' }}></div>
                            <div><strong>Authorized Signatory</strong></div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', padding: '20px', borderTop: '1px solid #e0e0e0', background: 'white', position: 'sticky', bottom: 0 }}>
                    <button onClick={generatePDF} disabled={loading} style={{ flex: 1, padding: '12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Download size={18} /> Download PDF
                    </button>
                    <button onClick={sendViaWhatsApp} disabled={loading} style={{ flex: 1, padding: '12px', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Send size={18} /> Send via WhatsApp
                    </button>
                    <button onClick={handleSave} style={{ flex: 1, padding: '12px', background: '#065F46', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FileText size={18} /> Save Quotation
                    </button>
                    <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#6B7280', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
                </div>
            </div>
        </div>
    );
};

// ... all the code ...

export default ProfessionalQuotation;
