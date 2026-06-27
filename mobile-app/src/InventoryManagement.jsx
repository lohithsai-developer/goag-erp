import { useState, useEffect } from 'react';

export default function InventoryManagement() {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Carbon Fiber Frame', quantity: 45, minStock: 20 },
    { id: 2, name: 'Brushless Motor', quantity: 120, minStock: 50 },
    { id: 3, name: 'Flight Controller', quantity: 35, minStock: 15 },
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Inventory Management</h2>
      <div style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#065F46', color: 'white' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Item Name</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Min Stock</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '12px' }}>{item.name}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: item.quantity <= item.minStock ? '#EF4444' : '#1F2937' }}>{item.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{item.minStock}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ 
                    background: item.quantity <= item.minStock ? '#FEF2F2' : '#E8F5E9', 
                    color: item.quantity <= item.minStock ? '#EF4444' : '#10B981', 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '12px' 
                  }}>
                    {item.quantity <= item.minStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
