// backend/src/models/TempCustomer.js
const { db } = require('../config/firebase');

const COLLECTION = 'temp_customers';

class TempCustomer {
  // Create temp customer
  static async create(data) {
    try {
      const id = 	emp_;
      const docData = {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        gst: data.gst || '',
        status: 'pending', // pending, converted
        converted_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await db.collection(COLLECTION).doc(id).set(docData);
      const doc = await db.collection(COLLECTION).doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(Error creating temp customer: );
    }
  }

  // Get all temp customers
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
      throw new Error(Error fetching temp customers: );
    }
  }

  // Get temp customer by ID
  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(Error finding temp customer: );
    }
  }

  // Update temp customer
  static async update(id, data) {
    try {
      data.updated_at = new Date().toISOString();
      await db.collection(COLLECTION).doc(id).update(data);
      const doc = await db.collection(COLLECTION).doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(Error updating temp customer: );
    }
  }

  // Delete temp customer
  static async delete(id) {
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return { success: true };
    } catch (error) {
      throw new Error(Error deleting temp customer: );
    }
  }

  // Convert to actual customer
  static async convertToCustomer(tempId, customerData) {
    try {
      // Get temp customer
      const temp = await this.findById(tempId);
      if (!temp) throw new Error('Temp customer not found');
      
      // Create actual customer
      const Customer = require('./Customer');
      const newCustomer = await Customer.create({
        name: customerData.name || temp.name,
        email: customerData.email || temp.email,
        phone: customerData.phone || temp.phone,
        address: customerData.address || temp.address,
        city: customerData.city || temp.city,
        state: customerData.state || temp.state,
        gst: customerData.gst || temp.gst,
        temp_id: tempId,
        first_order_id: customerData.first_order_id || ''
      });
      
      // Update temp customer status
      await this.update(tempId, {
        status: 'converted',
        converted_to: newCustomer.id
      });
      
      return newCustomer;
    } catch (error) {
      throw new Error(Error converting temp to customer: );
    }
  }
}

module.exports = TempCustomer;
