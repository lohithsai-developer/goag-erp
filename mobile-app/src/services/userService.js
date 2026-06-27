import { db, collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from '../firebase/config';

export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: users };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const toggleUserAccess = async (email) => {
  try {
    const docRef = doc(db, 'users', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentAccess = docSnap.data().hasAccess || false;
      await updateDoc(docRef, { hasAccess: !currentAccess });
      return { success: true, message: `Access toggled to ${!currentAccess}` };
    }
    return { success: false, message: 'User not found' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};