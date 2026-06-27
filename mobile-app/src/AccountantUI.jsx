import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const LOGO = "https://static.wixstatic.com/media/fc8181_8da7d78729ce4e34af3b4aeab5165218~mv2.png/v1/fill/w_980,h_980,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/MAIN_LOGO_GOAG.png";

// Default thresholds
const DEFAULT_WARNING = 8;
const DEFAULT_CRITICAL = 4;

export default function AccountantUI({ user, onLogout }) {
    // ========== STATE ==========
    const [activeTab, setActiveTab] = useState('inventory');
    const [parts, setParts] = useState([]);
    const [inventory, setInventory] = useState({});
    const [transactions, setTransactions] = useState([]);
    const [persons, setPersons] = useState([]);
    const [customThresholds, setCustomThresholds] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [showPersonModal, setShowPersonModal] = useState(false);
    const [newPersonName, setNewPersonName] = useState('');
    const [newPartName, setNewPartName] = useState('');
    const [selectedPart, setSelectedPart] = useState('');
    const [qtyToAdd, setQtyToAdd] = useState('');
    const [selectedPartRemove, setSelectedPartRemove] = useState('');
    const [qtyToRemove, setQtyToRemove] = useState(1);
    const [selectedPerson, setSelectedPerson] = useState('');
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editPart, setEditPart] = useState('');
    const [editQty, setEditQty] = useState('');
    const [editPerson, setEditPerson] = useState('');
    const [currentFilter, setCurrentFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [componentFilter, setComponentFilter] = useState('');
    const [exportFromDate, setExportFromDate] = useState('');
    const [exportToDate, setExportToDate] = useState('');
    const [exportProducts, setExportProducts] = useState([]);
    const [stockNotifications, setStockNotifications] = useState([]);
    const [showNotificationPanel, setShowNotificationPanel] = useState(false);
    const [undoMessage, setUndoMessage] = useState('');
    const [showUndoToast, setShowUndoToast] = useState(false);
    const [lastTransaction, setLastTransaction] = useState(null);
    const [undoTimeout, setUndoTimeout] = useState(null);
    const [time, setTime] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    // ========== HELPERS ==========
    const getThresholds = useCallback((part) => {
        if (customThresholds[part]) return customThresholds[part];
        return { warning: DEFAULT_WARNING, critical: DEFAULT_CRITICAL };
    }, [customThresholds]);

    const getStockAlertLevel = useCallback((part, qty) => {
        const th = getThresholds(part);
        if (qty <= th.critical) return { level: 'critical', text: 'Critical Low', class: 'badge-low-critical' };
        if (qty <= th.warning) return { level: 'warning', text: 'Low Stock', class: 'badge-low-warning' };
        return { level: 'ok', text: 'OK', class: 'badge-ok' };
    }, [getThresholds]);

    const escapeHtml = (str) => {
        return String(str || '').replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
    };

    // ========== LOCAL STORAGE ==========
    const loadData = useCallback(() => {
        const storedParts = localStorage.getItem('goag_parts');
        const storedInventory = localStorage.getItem('goag_inventory');
        const storedTransactions = localStorage.getItem('goag_transactions');
        const storedPersons = localStorage.getItem('goag_persons');
        const storedThresholds = localStorage.getItem('goag_thresholds');
        const storedNotifications = localStorage.getItem('goag_notifications');

        if (storedParts) setParts(JSON.parse(storedParts));
        if (storedInventory) setInventory(JSON.parse(storedInventory));
        if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
        if (storedPersons) setPersons(JSON.parse(storedPersons));
        if (storedThresholds) setCustomThresholds(JSON.parse(storedThresholds));
        if (storedNotifications) setStockNotifications(JSON.parse(storedNotifications));
    }, []);

    const saveData = useCallback(() => {
        localStorage.setItem('goag_parts', JSON.stringify(parts));
        localStorage.setItem('goag_inventory', JSON.stringify(inventory));
        localStorage.setItem('goag_transactions', JSON.stringify(transactions));
        localStorage.setItem('goag_persons', JSON.stringify(persons));
        localStorage.setItem('goag_thresholds', JSON.stringify(customThresholds));
        localStorage.setItem('goag_notifications', JSON.stringify(stockNotifications));
    }, [parts, inventory, transactions, persons, customThresholds, stockNotifications]);

    // ========== INIT DATA ==========
    const initData = useCallback(() => {
        loadData();
        if (parts.length === 0) {
            const defaultParts = ['Flight Controller', 'GPS Module', 'LiPo Battery 4S', 'Propeller Set', 'ESC 30A'];
            const defaultInventory = {};
            defaultParts.forEach(p => defaultInventory[p] = Math.floor(Math.random() * 20) + 3);
            setParts(defaultParts);
            setInventory(defaultInventory);
            setTransactions([{
                part: 'Flight Controller',
                qty: 5,
                person: 'Admin',
                type: 'RESTOCK',
                time: new Date().toLocaleString(),
                edited: false
            }]);
            setPersons(['Alex Chen', 'Jamie Rivera', 'Sam Taylor']);
        }
    }, [loadData, parts.length]);

    useEffect(() => {
        initData();
    }, [initData]);

    useEffect(() => {
        if (parts.length > 0 || Object.keys(inventory).length > 0) {
            saveData();
        }
    }, [parts, inventory, transactions, persons, customThresholds, stockNotifications, saveData]);

    // ========== REFRESH VIEWS ==========
    const refreshAllViews = useCallback(() => {
        // Update stats
        const total = parts.reduce((s, p) => s + (inventory[p] || 0), 0);
        const low = parts.filter(p => (inventory[p] || 0) <= getThresholds(p).warning).length;
        setTotalItems(total);
        setLowStockCount(low);
        setTotalTransactions(transactions.length);

        // Update chart
        updateChart();

        // Update component filters
        setComponentFilter(prev => prev);
    }, [parts, inventory, transactions, getThresholds]);

    useEffect(() => {
        refreshAllViews();
    }, [refreshAllViews]);

    // ========== TIME ==========
    useEffect(() => {
        const updateTime = () => {
            setTime(new Date().toLocaleString());
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // ========== CHART ==========
    const updateChart = useCallback(() => {
        const labels = parts;
        const dataValues = parts.map(p => inventory[p] || 0);
        const bgColors = parts.map(p => {
            const alert = getStockAlertLevel(p, inventory[p] || 0);
            return alert.level === 'critical' ? '#dc3545' : alert.level === 'warning' ? '#f97316' : '#2c8e6c';
        });

        setChartData({
            labels,
            datasets: [{
                label: 'Stock Level',
                data: dataValues,
                backgroundColor: bgColors,
                borderRadius: 10
            }]
        });
    }, [parts, inventory, getStockAlertLevel]);

    // ========== NOTIFICATIONS ==========
    const checkLowStock = useCallback(() => {
        const lowItems = [];
        parts.forEach(part => {
            const qty = inventory[part] || 0;
            const alertInfo = getStockAlertLevel(part, qty);
            if (alertInfo.level !== 'ok') {
                lowItems.push({
                    part,
                    qty,
                    level: alertInfo.level,
                    message: alertInfo.level === 'critical' 
                        ? `CRITICAL: Only ${qty} units left! Immediate action required.`
                        : `WARNING: Stock is low (${qty} units). Please restock soon.`
                });
            }
        });

        const currentKeys = new Set(stockNotifications.map(n => n.part));
        const newNotifications = [...stockNotifications];

        lowItems.forEach(item => {
            if (!currentKeys.has(item.part)) {
                newNotifications.unshift({
                    id: Date.now() + Math.random(),
                    part: item.part,
                    level: item.level,
                    message: item.message,
                    qty: item.qty,
                    timestamp: new Date().toLocaleString(),
                    read: false
                });
            } else {
                const existing = newNotifications.find(n => n.part === item.part);
                if (existing && existing.qty !== item.qty) {
                    existing.qty = item.qty;
                    existing.message = item.message;
                    existing.timestamp = new Date().toLocaleString();
                }
            }
        });

        const filteredNotifications = newNotifications.filter(n => {
            const currentQty = inventory[n.part] || 0;
            const th = getThresholds(n.part);
            return currentQty <= th.warning;
        });

        setStockNotifications(filteredNotifications.slice(0, 50));
    }, [parts, inventory, stockNotifications, getThresholds, getStockAlertLevel]);

    useEffect(() => {
        checkLowStock();
    }, [checkLowStock]);

    const unreadCount = stockNotifications.filter(n => !n.read).length;

    // ========== UNDO SYSTEM ==========
    const showUndo = (type, data) => {
        const msgs = {
            add_stock: 'Stock added - UNDO',
            remove_stock: 'Stock issued - UNDO',
            add_part: 'Component added - UNDO',
            clear_stock: 'Stock cleared - UNDO',
            delete_component: 'Deleted - UNDO'
        };
        setLastTransaction({ type, data });
        setUndoMessage(msgs[type] || 'Action - UNDO');
        setShowUndoToast(true);

        if (undoTimeout) clearTimeout(undoTimeout);
        const timeout = setTimeout(() => {
            setShowUndoToast(false);
            setLastTransaction(null);
        }, 10000);
        setUndoTimeout(timeout);
    };

    const handleUndo = () => {
        if (!lastTransaction) return;
        const action = lastTransaction;
        setLastTransaction(null);
        setShowUndoToast(false);
        if (undoTimeout) clearTimeout(undoTimeout);

        switch (action.type) {
            case 'add_stock':
                setInventory(prev => ({
                    ...prev,
                    [action.data.part]: (prev[action.data.part] || 0) - action.data.qty
                }));
                setTransactions(prev => prev.slice(1));
                break;
            case 'remove_stock':
                setInventory(prev => ({
                    ...prev,
                    [action.data.part]: (prev[action.data.part] || 0) + action.data.qty
                }));
                setTransactions(prev => prev.slice(1));
                break;
            case 'add_part':
                setParts(prev => prev.filter(p => p !== action.data.partName));
                setInventory(prev => {
                    const newInv = { ...prev };
                    delete newInv[action.data.partName];
                    return newInv;
                });
                setTransactions(prev => prev.slice(1));
                break;
            case 'clear_stock':
                setInventory(action.data.backupInventory);
                setTransactions(action.data.backupTransactions);
                break;
            case 'delete_component':
                if (action.data.partName && !parts.includes(action.data.partName)) {
                    setParts(prev => [...prev, action.data.partName]);
                    setInventory(prev => ({
                        ...prev,
                        [action.data.partName]: action.data.oldStock
                    }));
                    setTransactions(prev => prev.slice(1));
                }
                break;
        }
        showToast('Undo successful!', 'success');
    };

    // ========== TOAST ==========
    const showToast = (msg, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = 'custom-toast';
        let bgColor, icon;
        if (type === 'success') { bgColor = '#2c8e6c'; icon = 'fa-check-circle'; }
        else if (type === 'error') { bgColor = '#dc3545'; icon = 'fa-exclamation-circle'; }
        else { bgColor = '#1f2937'; icon = 'fa-info-circle'; }

        toast.innerHTML = `
            <div style="background: ${bgColor}; color: white; padding: 12px 24px; border-radius: 50px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 14px; font-weight: 500; position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 10000; animation: slideUp 0.3s ease;">
                <i class="fas ${icon}" style="font-size: 18px;"></i>
                <span>${msg}</span>
            </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            if (toast && toast.parentNode) toast.remove();
        }, 4000);
    };

    // ========== CRUD OPERATIONS ==========
    const addPart = () => {
        const name = newPartName.trim();
        if (!name) return alert('Enter name');
        if (parts.includes(name)) return alert('Exists');

        showUndo('add_part', { partName: name });
        setParts(prev => [...prev, name]);
        setInventory(prev => ({ ...prev, [name]: 0 }));
        setTransactions(prev => [{
            part: name,
            qty: 0,
            person: 'SYSTEM',
            type: 'NEW_PART',
            time: new Date().toLocaleString(),
            edited: false
        }, ...prev]);
        setNewPartName('');
        setSelectedPart(name);
        setSelectedPartRemove(name);
        showToast(`Added ${name}`, 'success');
    };

    const addStock = () => {
        const p = selectedPart;
        const q = parseInt(qtyToAdd);
        if (!p) return alert('Select part');
        if (isNaN(q) || q <= 0) return alert('Valid qty');

        showUndo('add_stock', { part: p, qty: q });
        setInventory(prev => ({ ...prev, [p]: (prev[p] || 0) + q }));
        setTransactions(prev => [{
            part: p,
            qty: q,
            person: 'SYSTEM',
            type: 'RESTOCK',
            time: new Date().toLocaleString(),
            edited: false
        }, ...prev]);
        setQtyToAdd('');
        showToast(`Added ${q} x ${p}`, 'success');
    };

    const removeStock = () => {
        const p = selectedPartRemove;
        const q = parseInt(qtyToRemove);
        const personVal = selectedPerson;
        if (!p) return alert('Select part');
        if (isNaN(q) || q <= 0) return alert('Valid qty');
        if ((inventory[p] || 0) < q) return alert(`Only ${inventory[p]} available`);

        showUndo('remove_stock', { part: p, qty: q, person: personVal });
        setInventory(prev => ({ ...prev, [p]: (prev[p] || 0) - q }));
        setTransactions(prev => [{
            part: p,
            qty: q,
            person: personVal || 'Unassigned',
            type: 'ISSUE',
            time: new Date().toLocaleString(),
            edited: false
        }, ...prev]);
        setQtyToRemove(1);
        showToast(`Issued ${q} x ${p}`, 'success');
    };

    const deleteStockItem = (partName) => {
        if (!confirm(`Delete "${partName}"?`)) return;
        const oldStock = inventory[partName];
        showUndo('delete_component', { partName, oldStock });
        setParts(prev => prev.filter(p => p !== partName));
        setInventory(prev => {
            const newInv = { ...prev };
            delete newInv[partName];
            return newInv;
        });
        setTransactions(prev => [{
            part: partName,
            qty: 0,
            person: 'SYSTEM',
            type: 'DELETED_COMPONENT',
            time: new Date().toLocaleString(),
            edited: false
        }, ...prev]);
        showToast(`"${partName}" deleted`, 'success');
    };

    const clearAllStock = () => {
        if (!confirm('Reset ALL stock to 0? Can undo.')) return;
        showUndo('clear_stock', {
            backupInventory: JSON.parse(JSON.stringify(inventory)),
            backupTransactions: JSON.parse(JSON.stringify(transactions))
        });
        const newInventory = {};
        parts.forEach(p => newInventory[p] = 0);
        setInventory(newInventory);
        setTransactions(prev => [{
            part: 'ALL',
            qty: 0,
            person: 'SYSTEM',
            type: 'CLEAR_ALL_STOCK',
            time: new Date().toLocaleString(),
            edited: false
        }, ...prev]);
        showToast('Stock cleared', 'success');
    };

    // ========== PERSON MANAGEMENT ==========
    const addPerson = () => {
        const name = newPersonName.trim();
        if (!name) return alert('Enter name');
        if (persons.includes(name)) return alert('Exists');
        setPersons(prev => [...prev, name]);
        setSelectedPerson(name);
        setNewPersonName('');
        showToast(`Added ${name}`, 'success');
    };

    const deletePerson = (name) => {
        if (!confirm(`Remove ${name}?`)) return;
        setPersons(prev => prev.filter(p => p !== name));
        if (selectedPerson === name && persons.length > 1) {
            setSelectedPerson(persons.filter(p => p !== name)[0]);
        }
        showToast(`Removed ${name}`, 'success');
    };

    // ========== ALERT THRESHOLDS ==========
    const saveAlertThresholds = (thresholds) => {
        setCustomThresholds(thresholds);
        showToast('Alert thresholds saved', 'success');
        setShowAlertModal(false);
    };

    // ========== EDIT TRANSACTION ==========
    const openEditModal = (index) => {
        const t = transactions[index];
        if (!t || (t.type !== 'RESTOCK' && t.type !== 'ISSUE')) {
            showToast('Only RESTOCK and ISSUE can be edited', 'error');
            return;
        }
        setEditingIndex(index);
        setEditPart(t.part);
        setEditQty(t.qty);
        setEditPerson(t.person);
        setShowEditModal(true);
    };

    const saveEditedTransaction = () => {
        if (editingIndex === null) return;
        const oldTx = transactions[editingIndex];
        const newQty = parseInt(editQty);
        if (isNaN(newQty) || newQty <= 0) {
            showToast('Invalid quantity', 'error');
            return;
        }

        const updatedTransactions = [...transactions];
        if (oldTx.type === 'RESTOCK') {
            setInventory(prev => ({
                ...prev,
                [oldTx.part]: (prev[oldTx.part] || 0) - oldTx.qty,
                [editPart]: (prev[editPart] || 0) + newQty
            }));
        } else if (oldTx.type === 'ISSUE') {
            if ((inventory[oldTx.part] || 0) + oldTx.qty < newQty) {
                showToast(`Not enough stock for ${editPart}`, 'error');
                return;
            }
            setInventory(prev => ({
                ...prev,
                [oldTx.part]: (prev[oldTx.part] || 0) + oldTx.qty - newQty
            }));
        }

        updatedTransactions[editingIndex] = {
            ...oldTx,
            part: editPart,
            qty: newQty,
            person: editPerson || oldTx.person,
            edited: true,
            editedTime: new Date().toLocaleString(),
            original: {
                part: oldTx.part,
                qty: oldTx.qty,
                person: oldTx.person
            }
        };
        setTransactions(updatedTransactions);
        setShowEditModal(false);
        showToast('Transaction edited successfully', 'success');
    };

    // ========== EXPORT ==========
    const exportWithFilters = () => {
        const fromDate = exportFromDate;
        const toDate = exportToDate;
        const selectedProducts = exportProducts;
        const includeAllProducts = selectedProducts.includes('all');

        let filtered = [...transactions];

        if (fromDate || toDate) {
            filtered = filtered.filter(t => {
                const txDateStr = t.time?.split(',')[0];
                if (!txDateStr) return true;
                const txDate = new Date(txDateStr);
                const fromObj = fromDate ? new Date(fromDate) : null;
                const toObj = toDate ? new Date(toDate) : null;
                if (fromObj && txDate < fromObj) return false;
                if (toObj) {
                    const nextDay = new Date(toObj);
                    nextDay.setDate(nextDay.getDate() + 1);
                    if (txDate >= nextDay) return false;
                }
                return true;
            });
        }

        if (!includeAllProducts && selectedProducts.length > 0) {
            filtered = filtered.filter(t => selectedProducts.includes(t.part));
        }

        if (filtered.length === 0) {
            showToast('No transactions found for selected filters!', 'error');
            return;
        }

        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>GOAG Transactions Export</title>
            <style>body{font-family:Arial,sans-serif;margin:20px}h1{color:#2c8e6c}.header{margin-bottom:20px;padding-bottom:10px;border-bottom:2px solid #2c8e6c}.filters{background:#f5f7fa;padding:10px;margin-bottom:20px;border-radius:8px;font-size:12px}table{border-collapse:collapse;width:100%;margin-top:20px}th{background:#2c8e6c;color:white;padding:10px;text-align:left}td{padding:8px;border:1px solid #ddd}tr:nth-child(even){background:#f9f9f9}.summary{margin-top:20px;padding:10px;background:#f5f7fa;border-radius:8px}</style></head>
            <body><div class="header"><h1>GOAG STATION - Transaction Report</h1><p>Generated: ${new Date().toLocaleString()}</p></div>
            <div class="filters"><strong>Export Filters:</strong><br>Date Range: ${fromDate || 'Start'} to ${toDate || 'End'}<br>Products: ${includeAllProducts ? 'All Products' : selectedProducts.join(', ')}<br>Total Transactions: ${filtered.length}</div>
            <table><thead><tr><th>Component</th><th>Quantity</th><th>Person</th><th>Type</th><th>Time</th><th>Edited</th></tr></thead><tbody>`;

        filtered.forEach(t => {
            html += `<tr><td>${escapeHtml(t.part)}</td><td>${t.qty}</td><td>${escapeHtml(t.person)}</td><td>${t.type}</td><td>${escapeHtml(t.time)}</td><td>${t.edited ? 'Yes' : 'No'}</td></tr>`;
        });

        html += `</tbody></table><div class="summary"><strong>Summary:</strong><br>Total Transactions: ${filtered.length}<br>Total Restock: ${filtered.filter(t => t.type === 'RESTOCK').length}<br>Total Issues: ${filtered.filter(t => t.type === 'ISSUE').length}<br>Total System Actions: ${filtered.filter(t => !['RESTOCK', 'ISSUE'].includes(t.type)).length}</div></body></html>`;

        const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        const fileName = `goag_transactions_${fromDate || 'start'}_to_${toDate || 'end'}_${new Date().toISOString().split('T')[0]}.xls`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`Exported ${filtered.length} transactions successfully!`, 'success');
        setShowExportModal(false);
    };

    // ========== FILTERED TRANSACTIONS ==========
    const getFilteredTransactions = () => {
        let filtered = [...transactions];
        if (currentFilter === 'restock') filtered = filtered.filter(t => t.type === 'RESTOCK');
        else if (currentFilter === 'issue') filtered = filtered.filter(t => t.type === 'ISSUE');
        else if (currentFilter === 'system') filtered = filtered.filter(t => !['RESTOCK', 'ISSUE'].includes(t.type));

        if (dateFilter) {
            filtered = filtered.filter(t => t.time?.split(',')[0] === new Date(dateFilter).toLocaleDateString());
        }
        if (componentFilter) {
            filtered = filtered.filter(t => t.part === componentFilter);
        }
        return filtered;
    };

    // ========== RENDER HELPERS ==========
    const filteredParts = parts.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

    // ========== STYLES ==========
    const styles = {
        container: {
            fontFamily: "'Inter', sans-serif",
            background: '#f0f2f8',
            color: '#1a2c3e',
            minHeight: '100vh',
            position: 'relative'
        },
        header: {
            background: 'linear-gradient(135deg, #0b2b26 0%, #1a4d3e 100%)',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        },
        logoArea: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        headerLogo: {
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.1)',
            padding: '4px'
        },
        logo: {
            fontWeight: 700,
            fontSize: '1.3rem',
            background: 'linear-gradient(120deg, #ffffff, #c7f0c2)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
        },
        logoSub: {
            fontSize: '0.6rem',
            color: '#b0dfcc'
        },
        nav: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center'
        },
        navBtn: {
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '40px',
            color: '#f0f9f4',
            fontWeight: 500,
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: '0.2s'
        },
        navBtnActive: {
            background: '#2c8e6c',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        },
        logoutBtn: {
            background: 'rgba(220, 53, 69, 0.2)'
        },
        time: {
            background: '#0e2f28',
            padding: '6px 14px',
            borderRadius: '40px',
            fontSize: '0.85rem',
            fontWeight: 600,
            fontFamily: 'monospace',
            color: '#ffffff',
            letterSpacing: '0.5px'
        },
        container: {
            maxWidth: '1400px',
            margin: '20px auto',
            padding: '0 20px',
            position: 'relative',
            zIndex: 1
        },
        card: {
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(2px)',
            borderRadius: '24px',
            padding: '20px 24px',
            marginBottom: '20px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
            border: '1px solid #eef2f0'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
        },
        pageTitle: {
            fontSize: '1.5rem',
            fontWeight: 600,
            background: 'linear-gradient(130deg, #1f4e3f, #2a6e55)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            margin: '0 0 12px 0'
        },
        rowFlex: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'flex-end'
        },
        inputGroup: {
            flex: 1,
            minWidth: '140px'
        },
        inputGroupLabel: {
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: '#5a7268',
            display: 'block',
            marginBottom: '4px'
        },
        input: {
            width: '100%',
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            fontSize: '0.85rem',
            transition: '0.2s',
            boxSizing: 'border-box'
        },
        select: {
            width: '100%',
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            fontSize: '0.85rem',
            transition: '0.2s',
            background: 'white',
            boxSizing: 'border-box'
        },
        primaryBtn: {
            background: '#1f6e54',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '40px',
            fontWeight: 600,
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: '0.2s',
            fontSize: '0.85rem'
        },
        secondaryBtn: {
            background: '#f0f4f9',
            border: '1px solid #cddfd6',
            padding: '8px 16px',
            borderRadius: '40px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
        },
        searchWrapper: {
            position: 'relative',
            maxWidth: '280px'
        },
        searchInput: {
            paddingLeft: '38px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '14px',
            border: '1.5px solid #e2e8f0',
            fontSize: '0.85rem',
            transition: '0.2s',
            boxSizing: 'border-box'
        },
        tableWrapper: {
            overflowX: 'auto',
            marginTop: '20px',
            WebkitOverflowScrolling: 'touch'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            minWidth: '600px'
        },
        th: {
            textAlign: 'left',
            padding: '12px',
            background: '#f8fafc',
            color: '#2c5a4a',
            fontWeight: 600,
            borderBottom: '1px solid #e2ede6'
        },
        td: {
            padding: '12px',
            borderBottom: '1px solid #edf2f0'
        },
        lowRowCritical: {
            background: '#ffe5e5'
        },
        lowRowWarning: {
            background: '#fff3e8'
        },
        badgeLowCritical: {
            background: '#dc3545',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '40px',
            fontSize: '0.7rem',
            fontWeight: 600
        },
        badgeLowWarning: {
            background: '#f97316',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '40px',
            fontSize: '0.7rem',
            fontWeight: 600
        },
        badgeOk: {
            background: '#2c8e6c',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '40px',
            fontSize: '0.7rem',
            fontWeight: 600
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '16px',
            marginTop: '24px'
        },
        statCard: {
            background: '#f8fafc',
            padding: '16px',
            borderRadius: '20px',
            textAlign: 'center'
        },
        statValue: {
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#1f4e3f'
        },
        statLabel: {
            fontSize: '0.7rem',
            color: '#6c8b7c',
            textTransform: 'uppercase'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modalBox: {
            background: 'white',
            width: '90%',
            maxWidth: '420px',
            borderRadius: '28px',
            padding: '24px'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
        },
        modalClose: {
            fontSize: '24px',
            cursor: 'pointer'
        },
        personList: {
            listStyle: 'none',
            marginTop: '16px',
            maxHeight: '280px',
            overflowY: 'auto',
            padding: 0
        },
        personListItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f9fbf9',
            margin: '8px 0',
            padding: '10px 12px',
            borderRadius: '60px',
            border: '1px solid #e2eae4'
        },
        deletePerson: {
            background: 'none',
            border: 'none',
            color: '#bc6c4b',
            cursor: 'pointer',
            padding: '5px 10px',
            borderRadius: '30px'
        },
        filterBar: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'flex-end',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e2ede6'
        },
        tabs: {
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            borderBottom: '1px solid #e2ede6',
            paddingBottom: '8px'
        },
        tabBtn: {
            background: 'none',
            border: 'none',
            padding: '8px 20px',
            borderRadius: '40px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 500,
            color: '#5a7268',
            transition: '0.2s'
        },
        tabBtnActive: {
            background: '#2c8e6c',
            color: 'white'
        },
        editBtn: {
            background: 'none',
            border: 'none',
            color: '#2c8e6c',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '5px 8px',
            borderRadius: '20px',
            marginRight: '5px'
        },
        deleteBtn: {
            background: 'none',
            border: 'none',
            color: '#dc3545',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '5px 10px',
            borderRadius: '20px'
        },
        notificationBell: {
            position: 'fixed',
            top: '90px',
            right: '20px',
            width: '48px',
            height: '48px',
            background: '#2c8e6c',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            zIndex: 1000,
            transition: 'transform 0.2s'
        },
        notificationCount: {
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#dc3545',
            color: 'white',
            borderRadius: '50%',
            width: '22px',
            height: '22px',
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
        },
        notificationPanel: {
            position: 'fixed',
            top: '90px',
            right: '80px',
            width: '320px',
            maxHeight: '400px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: 1001,
            overflow: 'hidden',
            animation: 'slideInRight 0.3s ease'
        },
        notificationHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            background: '#2c8e6c',
            color: 'white'
        },
        notificationList: {
            maxHeight: '350px',
            overflowY: 'auto'
        },
        notificationItem: {
            padding: '12px 16px',
            borderBottom: '1px solid #eef2f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            transition: 'background 0.2s'
        },
        notificationItemCritical: {
            borderLeft: '4px solid #dc3545'
        },
        notificationItemWarning: {
            borderLeft: '4px solid #f97316'
        },
        notificationIcon: {
            fontSize: '1.2rem'
        },
        notificationIconCritical: {
            color: '#dc3545'
        },
        notificationIconWarning: {
            color: '#f97316'
        },
        notificationContent: {
            flex: 1
        },
        notificationTitle: {
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#1a2c3e'
        },
        notificationMessage: {
            fontSize: '0.7rem',
            color: '#6c8b7c',
            marginTop: '2px'
        },
        notificationTime: {
            fontSize: '0.6rem',
            color: '#8aa99b',
            marginTop: '4px'
        },
        undoToast: {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease'
        },
        undoToastContent: {
            background: '#1f2937',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            fontSize: '0.85rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        undoActionBtn: {
            background: '#2c8e6c',
            border: 'none',
            padding: '6px 16px',
            borderRadius: '40px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer'
        },
        hidden: { display: 'none' }
    };

    // ========== RENDER COMPONENTS ==========

    // Person Modal
    const PersonModal = () => {
        if (!showPersonModal) return null;
        return (
            <div style={styles.modal}>
                <div style={styles.modalBox}>
                    <div style={styles.modalHeader}>
                        <h3><i className="fas fa-user-plus"></i> Team members</h3>
                        <span style={styles.modalClose} onClick={() => setShowPersonModal(false)}>✕</span>
                    </div>
                    <div style={styles.rowFlex}>
                        <div style={styles.inputGroup}>
                            <input
                                style={styles.input}
                                id="newPerson"
                                placeholder="Full name"
                                value={newPersonName}
                                onChange={(e) => setNewPersonName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                            />
                        </div>
                        <button style={styles.primaryBtn} onClick={addPerson}>Add</button>
                    </div>
                    <ul style={styles.personList}>
                        {persons.length ? persons.map(p => (
                            <li key={p} style={styles.personListItem}>
                                <span><i className="fas fa-user"></i> {escapeHtml(p)}</span>
                                <button style={styles.deletePerson} onClick={() => deletePerson(p)}>
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </li>
                        )) : <li>No team members</li>}
                    </ul>
                </div>
            </div>
        );
    };

    // Alert Threshold Modal
    const AlertModal = () => {
        if (!showAlertModal) return null;
        const [thresholds, setThresholds] = useState({ ...customThresholds });

        return (
            <div style={styles.modal}>
                <div style={{ ...styles.modalBox, maxWidth: '500px' }}>
                    <div style={styles.modalHeader}>
                        <h3><i className="fas fa-sliders-h"></i> Customize Stock Alerts</h3>
                        <span style={styles.modalClose} onClick={() => setShowAlertModal(false)}>✕</span>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {parts.map(part => {
                            const th = thresholds[part] || { warning: DEFAULT_WARNING, critical: DEFAULT_CRITICAL };
                            return (
                                <div key={part} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    borderBottom: '1px solid #e2ede6',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                }}>
                                    <span style={{ fontWeight: 500, minWidth: '140px' }}>{part}</span>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <label>Warning ≤</label>
                                        <input
                                            type="number"
                                            style={{ width: '80px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #ddd' }}
                                            value={th.warning}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val > 0) {
                                                    setThresholds(prev => ({
                                                        ...prev,
                                                        [part]: { ...prev[part], warning: val }
                                                    }));
                                                }
                                            }}
                                        />
                                        <label>Critical ≤</label>
                                        <input
                                            type="number"
                                            style={{ width: '80px', padding: '6px 8px', borderRadius: '8px', border: '1px solid #ddd' }}
                                            value={th.critical}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val) && val > 0) {
                                                    setThresholds(prev => ({
                                                        ...prev,
                                                        [part]: { ...prev[part], critical: val }
                                                    }));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        style={{ ...styles.primaryBtn, width: '100%', marginTop: '16px', justifyContent: 'center' }}
                        onClick={() => saveAlertThresholds(thresholds)}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        );
    };

    // Export Modal
    const ExportModal = () => {
        if (!showExportModal) return null;
        return (
            <div style={styles.modal}>
                <div style={{ ...styles.modalBox, maxWidth: '480px' }}>
                    <div style={styles.modalHeader}>
                        <h3><i className="fas fa-file-excel"></i> Export Transactions</h3>
                        <span style={styles.modalClose} onClick={() => setShowExportModal(false)}>✕</span>
                    </div>
                    <p style={{ marginBottom: '16px', color: '#6c8b7c' }}>Select date range and products to export</p>
                    <div style={styles.inputGroup}>
                        <label style={styles.inputGroupLabel}><i className="fas fa-calendar-alt"></i> From Date</label>
                        <input
                            style={styles.input}
                            type="date"
                            value={exportFromDate}
                            onChange={(e) => setExportFromDate(e.target.value)}
                        />
                    </div>
                    <div style={{ ...styles.inputGroup, marginTop: '12px' }}>
                        <label style={styles.inputGroupLabel}><i className="fas fa-calendar-alt"></i> To Date</label>
                        <input
                            style={styles.input}
                            type="date"
                            value={exportToDate}
                            onChange={(e) => setExportToDate(e.target.value)}
                        />
                    </div>
                    <div style={{ ...styles.inputGroup, marginTop: '12px' }}>
                        <label style={styles.inputGroupLabel}><i className="fas fa-microchip"></i> Select Products</label>
                        <select
                            style={{ ...styles.select, height: '120px' }}
                            multiple
                            value={exportProducts}
                            onChange={(e) => {
                                const options = Array.from(e.target.selectedOptions, option => option.value);
                                setExportProducts(options);
                            }}
                        >
                            <option value="all">All Products</option>
                            {parts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <small style={{ color: '#8aa99b', fontSize: '0.7rem' }}>Hold Ctrl/Cmd to select multiple</small>
                    </div>
                    <div style={{ ...styles.rowFlex, gap: '10px', marginTop: '16px' }}>
                        <button style={{ ...styles.primaryBtn, flex: 1, justifyContent: 'center' }} onClick={exportWithFilters}>
                            <i className="fas fa-download"></i> Export Now
                        </button>
                        <button style={styles.secondaryBtn} onClick={() => setShowExportModal(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    };

    // Edit Transaction Modal
    const EditModal = () => {
        if (!showEditModal) return null;
        return (
            <div style={styles.modal}>
                <div style={{ ...styles.modalBox, maxWidth: '450px' }}>
                    <div style={styles.modalHeader}>
                        <h3><i className="fas fa-edit"></i> Edit Transaction</h3>
                        <span style={styles.modalClose} onClick={() => setShowEditModal(false)}>✕</span>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.inputGroupLabel}>Component</label>
                        <select style={styles.select} value={editPart} onChange={(e) => setEditPart(e.target.value)}>
                            {parts.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div style={{ ...styles.inputGroup, marginTop: '12px' }}>
                        <label style={styles.inputGroupLabel}>Quantity</label>
                        <input style={styles.input} type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} min="1" />
                    </div>
                    <div style={{ ...styles.inputGroup, marginTop: '12px' }}>
                        <label style={styles.inputGroupLabel}>Person</label>
                        <input style={styles.input} type="text" value={editPerson} onChange={(e) => setEditPerson(e.target.value)} placeholder="Person name" />
                    </div>
                    <div style={{ ...styles.rowFlex, gap: '10px', marginTop: '16px' }}>
                        <button style={{ ...styles.primaryBtn, flex: 1, justifyContent: 'center' }} onClick={saveEditedTransaction}>
                            Save Changes
                        </button>
                        <button style={styles.secondaryBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    };

    // ========== MAIN RENDER ==========
    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.logoArea}>
                    <img src={LOGO} alt="GOAG Logo" style={styles.headerLogo} />
                    <div>
                        <div style={styles.logo}>GOAG STATION</div>
                        <div style={styles.logoSub}>Drones & Services · Smart Inventory</div>
                    </div>
                </div>
                <div style={styles.nav}>
                    <span style={styles.time}>{time}</span>
                    <button
                        style={{ ...styles.navBtn, ...(activeTab === 'inventory' ? styles.navBtnActive : {}) }}
                        onClick={() => setActiveTab('inventory')}
                    >
                        <i className="fas fa-boxes"></i> <span>Inventory</span>
                    </button>
                    <button
                        style={{ ...styles.navBtn, ...(activeTab === 'stock' ? styles.navBtnActive : {}) }}
                        onClick={() => setActiveTab('stock')}
                    >
                        <i className="fas fa-warehouse"></i> <span>Stock</span>
                    </button>
                    <button
                        style={{ ...styles.navBtn, ...(activeTab === 'transactions' ? styles.navBtnActive : {}) }}
                        onClick={() => setActiveTab('transactions')}
                    >
                        <i className="fas fa-history"></i> <span>Logs</span>
                    </button>
                    <button
                        style={{ ...styles.navBtn, ...(activeTab === 'dashboard' ? styles.navBtnActive : {}) }}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="fas fa-chart-line"></i> <span>Analytics</span>
                    </button>
                    <button style={styles.navBtn} onClick={() => setShowPersonModal(true)}>
                        <i className="fas fa-users"></i> <span>Team</span>
                    </button>
                    <button style={{ ...styles.navBtn, ...styles.logoutBtn }} onClick={onLogout}>
                        <i className="fas fa-sign-out-alt"></i> <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Notification Bell */}
            <div style={styles.notificationBell} onClick={() => setShowNotificationPanel(!showNotificationPanel)}>
                <i className="fas fa-bell" style={{ color: 'white', fontSize: '1.4rem' }}></i>
                {unreadCount > 0 && (
                    <span style={styles.notificationCount}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </div>

            {/* Notification Panel */}
            {showNotificationPanel && (
                <div style={styles.notificationPanel}>
                    <div style={styles.notificationHeader}>
                        <h4 style={{ margin: 0 }}><i className="fas fa-exclamation-triangle"></i> Low Stock Alerts</h4>
                        <span style={styles.modalClose} onClick={() => setShowNotificationPanel(false)}>✕</span>
                    </div>
                    <div style={styles.notificationList}>
                        {stockNotifications.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#8aa99b' }}>
                                <i className="fas fa-check-circle"></i>
                                <p>No low stock alerts</p>
                            </div>
                        ) : (
                            stockNotifications.map(n => (
                                <div
                                    key={n.id}
                                    style={{
                                        ...styles.notificationItem,
                                        ...(n.level === 'critical' ? styles.notificationItemCritical : styles.notificationItemWarning)
                                    }}
                                    onClick={() => {
                                        setActiveTab('stock');
                                        setShowNotificationPanel(false);
                                    }}
                                >
                                    <div style={{
                                        ...styles.notificationIcon,
                                        ...(n.level === 'critical' ? styles.notificationIconCritical : styles.notificationIconWarning)
                                    }}>
                                        <i className={`fas ${n.level === 'critical' ? 'fa-exclamation-triangle' : 'fa-exclamation-circle'}`}></i>
                                    </div>
                                    <div style={styles.notificationContent}>
                                        <div style={styles.notificationTitle}>{n.part}</div>
                                        <div style={styles.notificationMessage}>{n.message}</div>
                                        <div style={styles.notificationTime}>{n.timestamp}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Undo Toast */}
            {showUndoToast && (
                <div style={styles.undoToast}>
                    <div style={styles.undoToastContent}>
                        <i className="fas fa-undo-alt"></i>
                        <span>{undoMessage}</span>
                        <button style={styles.undoActionBtn} onClick={handleUndo}>UNDO</button>
                        <button style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1rem' }} onClick={() => setShowUndoToast(false)}>✕</button>
                    </div>
                </div>
            )}

            <main style={styles.container}>
                {/* INVENTORY TAB */}
                {activeTab === 'inventory' && (
                    <div className="page">
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h1 style={styles.pageTitle}><i className="fas fa-clipboard-list"></i> Live inventory</h1>
                                <div style={styles.searchWrapper}>
                                    <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '12px', color: '#8aa99b' }}></i>
                                    <input
                                        style={styles.searchInput}
                                        placeholder="Filter components..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div style={styles.rowFlex}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}><i className="fas fa-microchip"></i> Component</label>
                                    <select style={styles.select} value={selectedPartRemove} onChange={(e) => setSelectedPartRemove(e.target.value)}>
                                        {parts.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}>Quantity</label>
                                    <input style={styles.input} type="number" value={qtyToRemove} onChange={(e) => setQtyToRemove(parseInt(e.target.value) || 1)} min="1" />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}>Assign to</label>
                                    <select style={styles.select} value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)}>
                                        {persons.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <button style={styles.primaryBtn} onClick={removeStock}><i className="fas fa-arrow-down"></i> Issue part</button>
                            </div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Component</th>
                                            <th style={styles.th}>Stock</th>
                                            <th style={styles.th}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredParts.length === 0 ? (
                                            <tr><td colSpan="3" style={{ ...styles.td, textAlign: 'center', color: '#8aa99b' }}>No components found</td></tr>
                                        ) : (
                                            filteredParts.map(part => {
                                                const qty = inventory[part] || 0;
                                                const alertInfo = getStockAlertLevel(part, qty);
                                                return (
                                                    <tr key={part} style={alertInfo.level === 'critical' ? styles.lowRowCritical : alertInfo.level === 'warning' ? styles.lowRowWarning : {}}>
                                                        <td style={styles.td}><i className="fas fa-microchip"></i> {escapeHtml(part)}</td>
                                                        <td style={styles.td}><strong>{qty}</strong></td>
                                                        <td style={styles.td}>
                                                            <span style={alertInfo.level === 'critical' ? styles.badgeLowCritical : alertInfo.level === 'warning' ? styles.badgeLowWarning : styles.badgeOk}>
                                                                {alertInfo.text}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* STOCK TAB */}
                {activeTab === 'stock' && (
                    <div className="page">
                        <div style={styles.card}>
                            <h1 style={styles.pageTitle}><i className="fas fa-plus-circle"></i> Component registry</h1>
                            <div style={styles.rowFlex}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}>New component</label>
                                    <input style={styles.input} placeholder="e.g., Flight Controller" value={newPartName} onChange={(e) => setNewPartName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addPart()} />
                                </div>
                                <button style={styles.primaryBtn} onClick={addPart}><i className="fas fa-plus"></i> Add</button>
                            </div>
                            <div style={{ ...styles.rowFlex, marginTop: '20px' }}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}>Select part</label>
                                    <select style={styles.select} value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)}>
                                        {parts.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}>Add quantity</label>
                                    <input style={styles.input} type="number" placeholder="Quantity" value={qtyToAdd} onChange={(e) => setQtyToAdd(e.target.value)} min="1" />
                                </div>
                                <button style={styles.primaryBtn} onClick={addStock}><i className="fas fa-dolly"></i> Restock</button>
                            </div>
                        </div>
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={{ margin: 0 }}><i className="fas fa-cubes"></i> Stock levels</h3>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button style={{ ...styles.secondaryBtn, background: '#2c8e6c', color: 'white' }} onClick={() => setShowAlertModal(true)}>
                                        <i className="fas fa-sliders-h"></i> Customize Alerts
                                    </button>
                                    <button style={{ ...styles.secondaryBtn, background: '#fee2e2', color: '#c2410c' }} onClick={clearAllStock}>
                                        <i className="fas fa-trash-alt"></i> Clear All Stock
                                    </button>
                                </div>
                            </div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Component</th>
                                            <th style={styles.th}>Stock</th>
                                            <th style={styles.th}>Alert Level</th>
                                            <th style={styles.th}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parts.map(part => {
                                            const qty = inventory[part] || 0;
                                            const alertInfo = getStockAlertLevel(part, qty);
                                            return (
                                                <tr key={part} style={alertInfo.level === 'critical' ? styles.lowRowCritical : alertInfo.level === 'warning' ? styles.lowRowWarning : {}}>
                                                    <td style={styles.td}><i className="fas fa-cube"></i> {escapeHtml(part)}</td>
                                                    <td style={styles.td}><strong>{qty}</strong> pcs</td>
                                                    <td style={styles.td}>
                                                        <span style={alertInfo.level === 'critical' ? styles.badgeLowCritical : alertInfo.level === 'warning' ? styles.badgeLowWarning : styles.badgeOk}>
                                                            {alertInfo.text}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <button style={styles.deleteBtn} onClick={() => deleteStockItem(part)}>
                                                            <i className="fas fa-trash-alt"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TRANSACTIONS TAB */}
                {activeTab === 'transactions' && (
                    <div className="page">
                        <div style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h1 style={styles.pageTitle}><i className="fas fa-scroll"></i> Transaction history</h1>
                                <button style={{ ...styles.secondaryBtn, background: '#2c8e6c', color: 'white' }} onClick={() => setShowExportModal(true)}>
                                    <i className="fas fa-file-excel"></i> Export Excel
                                </button>
                            </div>
                            <div style={styles.filterBar}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}><i className="fas fa-calendar-day"></i> Filter by Date</label>
                                    <input style={styles.input} type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.inputGroupLabel}><i className="fas fa-microchip"></i> Filter by Component</label>
                                    <select style={styles.select} value={componentFilter} onChange={(e) => setComponentFilter(e.target.value)}>
                                        <option value="">All Components</option>
                                        {parts.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <button style={styles.secondaryBtn} onClick={() => { setDateFilter(''); setComponentFilter(''); }}><i className="fas fa-undo"></i> Reset</button>
                            </div>
                            <div style={styles.tabs}>
                                <button style={{ ...styles.tabBtn, ...(currentFilter === 'all' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentFilter('all')}>All</button>
                                <button style={{ ...styles.tabBtn, ...(currentFilter === 'restock' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentFilter('restock')}>Restock</button>
                                <button style={{ ...styles.tabBtn, ...(currentFilter === 'issue' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentFilter('issue')}>Issue</button>
                                <button style={{ ...styles.tabBtn, ...(currentFilter === 'system' ? styles.tabBtnActive : {}) }} onClick={() => setCurrentFilter('system')}>System</button>
                            </div>
                            <div style={styles.tableWrapper}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Component</th>
                                            <th style={styles.th}>Qty</th>
                                            <th style={styles.th}>Person</th>
                                            <th style={styles.th}>Type</th>
                                            <th style={styles.th}>Time</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getFilteredTransactions().slice(0, 200).map((t, idx) => {
                                            const realIndex = transactions.indexOf(t);
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #edf2f0' }}>
                                                    <td style={styles.td}>{escapeHtml(t.part)}</td>
                                                    <td style={styles.td}>{t.qty}</td>
                                                    <td style={styles.td}>
                                                        <i className="fas fa-user"></i> {escapeHtml(t.person)}
                                                        {t.edited && <span style={{ background: '#ffc107', color: '#000', padding: '2px 6px', borderRadius: '20px', fontSize: '0.6rem', marginLeft: '5px' }}>edited</span>}
                                                    </td>
                                                    <td style={styles.td}>
                                                        {t.type === 'RESTOCK' && <i className="fas fa-plus-circle" style={{ color: '#2c8e6c' }}></i>}
                                                        {t.type === 'ISSUE' && <i className="fas fa-minus-circle" style={{ color: '#e67e22' }}></i>}
                                                        {t.type === 'NEW_PART' && <i className="fas fa-plus-square" style={{ color: '#3498db' }}></i>}
                                                        {(t.type === 'CLEAR_ALL_STOCK' || t.type === 'DELETED_COMPONENT') && <i className="fas fa-trash-alt" style={{ color: '#dc3545' }}></i>}
                                                        {' '}{t.type}
                                                    </td>
                                                    <td style={styles.td}><i className="far fa-clock"></i> {escapeHtml(t.time)}</td>
                                                    <td style={styles.td}>
                                                        {(t.type === 'RESTOCK' || t.type === 'ISSUE') && (
                                                            <button style={styles.editBtn} onClick={() => openEditModal(realIndex)}>
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {getFilteredTransactions().length === 0 && (
                                            <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#8aa99b', padding: '30px' }}>No transactions found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="page">
                        <div style={styles.card}>
                            <h1 style={styles.pageTitle}><i className="fas fa-chart-simple"></i> Analytics</h1>
                            <div style={{ maxHeight: '350px' }}>
                                <Bar
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: { legend: { position: 'top' } },
                                        scales: { y: { beginAtZero: true, title: { display: true, text: 'Quantity' } } }
                                    }}
                                />
                            </div>
                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <i className="fas fa-boxes" style={{ fontSize: '1.8rem', color: '#2c8e6c' }}></i>
                                    <div style={styles.statValue}>{totalItems}</div>
                                    <div style={styles.statLabel}>Total Items</div>
                                </div>
                                <div style={styles.statCard}>
                                    <i className="fas fa-exclamation-triangle" style={{ fontSize: '1.8rem', color: '#f97316' }}></i>
                                    <div style={styles.statValue}>{lowStockCount}</div>
                                    <div style={styles.statLabel}>Low Stock</div>
                                </div>
                                <div style={styles.statCard}>
                                    <i className="fas fa-exchange-alt" style={{ fontSize: '1.8rem', color: '#2c8e6c' }}></i>
                                    <div style={styles.statValue}>{totalTransactions}</div>
                                    <div style={styles.statLabel}>Transactions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            <PersonModal />
            <AlertModal />
            <ExportModal />
            <EditModal />
        </div>
    );
}
