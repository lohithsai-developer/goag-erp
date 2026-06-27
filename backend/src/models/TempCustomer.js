// backend/src/models/TempCustomer.js
const { db } = require('../config/firebase');

const COLLECTION = 'temp_customers';

class TempCustomer {
  static async create(data) {
    try {
      const id = `temp_${Date.now()}`;
      const docData = {
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        gst: data.gst || '',
        status: 'pending',
        converted_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await db.collection(COLLECTION).doc(id).set(docData);
      const doc = await db.collection(COLLECTION).doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating temp customer: ${error.message}`);
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
      throw new Error(`Error fetching temp customers: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding temp customer: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      data.updated_at = new Date().toISOString();
      await db.collection(COLLECTION).doc(id).update(data);
      const doc = await db.collection(COLLECTION).doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error updating temp customer: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting temp customer: ${error.message}`);
    }
  }

  static async convertToCustomer(tempId, customerData) {
    try {
      const temp = await this.findById(tempId);
      if (!temp) throw new Error('Temp customer not found');

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

      await this.update(tempId, {
        status: 'converted',
        converted_to: newCustomer.id
      });

      return newCustomer;
    } catch (error) {
      throw new Error(`Error converting temp to customer: ${error.message}`);
    }
  }
}

module.exports = TempCustomer;