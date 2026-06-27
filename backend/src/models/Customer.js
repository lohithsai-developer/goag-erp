// backend/src/models/Customer.js
const { db } = require('../config/firebase');

const COLLECTION = 'customers';

class Customer {
  static async create(data) {
    try {
      const id = `CUST-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
      const docData = {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        gst: data.gst || '',
        temp_id: data.temp_id || '',
        first_order_id: data.first_order_id || '',
        total_orders: 0,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.collection(COLLECTION).doc(id).set(docData);
      const doc = await db.collection(COLLECTION).doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const snapshot = await db.collection(COLLECTION)
        .orderBy('created_at', 'desc')
        .get();

      const results = [];
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      throw new Error(`Error fetching customers: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding customer: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      data.updated_at = new Date().toISOString();
      await db.collection(COLLECTION).doc(id).update(data);
      const doc = await db.collection(COLLECTION).doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error updating customer: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting customer: ${error.message}`);
    }
  }

  static async updateOrderStats(id, orderAmount) {
    try {
      const customer = await this.findById(id);
      if (!customer) throw new Error('Customer not found');

      await db.collection(COLLECTION).doc(id).update({
        total_orders: (customer.total_orders || 0) + 1,
        total_spent: (customer.total_spent || 0) + orderAmount,
        last_order_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating customer stats: ${error.message}`);
    }
  }

  static async getWithOrders(id) {
    try {
      const customer = await this.findById(id);
      if (!customer) throw new Error('Customer not found');

      const { db } = require('../config/firebase');
      const snapshot = await db.collection('orders')
        .where('customer_id', '==', id)
        .get();

      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });

      return { ...customer, orders };
    } catch (error) {
      throw new Error(`Error getting customer with orders: ${error.message}`);
    }
  }
}

module.exports = Customer;