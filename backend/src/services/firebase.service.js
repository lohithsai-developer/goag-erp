const { db } = require('../config/firebase');
console.log('✅ Firebase service loaded');

class FirebaseService {
    // Create a document
    async create(collection, data, id = null) {
        try {
            let docRef;
            if (id) {
                docRef = db.collection(collection).doc(id);
                await docRef.set(data);
            } else {
                docRef = await db.collection(collection).add(data);
            }

            const doc = await docRef.get();
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            throw new Error(`Error creating document: ${error.message}`);
        }
    }

    // Get all documents from a collection
    async getAll(collection, orderByField = null, orderDirection = 'asc') {
        try {
            let query = db.collection(collection);

            if (orderByField) {
                query = query.orderBy(orderByField, orderDirection);
            }

            const snapshot = await query.get();
            const documents = [];

            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return documents;
        } catch (error) {
            throw new Error(`Error getting documents: ${error.message}`);
        }
    }

    // Get a document by ID
    async getById(collection, id) {
        try {
            const doc = await db.collection(collection).doc(id).get();

            if (!doc.exists) {
                return null;
            }

            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            throw new Error(`Error getting document: ${error.message}`);
        }
    }

    // Get documents with filters
    async getWhere(collection, filters) {
        try {
            let query = db.collection(collection);

            Object.keys(filters).forEach(field => {
                query = query.where(field, '==', filters[field]);
            });

            const snapshot = await query.get();
            const documents = [];

            snapshot.forEach(doc => {
                documents.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return documents;
        } catch (error) {
            throw new Error(`Error filtering documents: ${error.message}`);
        }
    }

    // Update a document
    async update(collection, id, data) {
        try {
            await db.collection(collection).doc(id).update(data);

            const doc = await db.collection(collection).doc(id).get();
            return {
                id: doc.id,
                ...doc.data()
            };
        } catch (error) {
            throw new Error(`Error updating document: ${error.message}`);
        }
    }

    // Delete a document
    async delete(collection, id) {
        try {
            await db.collection(collection).doc(id).delete();
            return { success: true, message: 'Document deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting document: ${error.message}`);
        }
    }
}

module.exports = new FirebaseService();