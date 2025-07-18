// services/firebaseService.js
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Authentication
export const loginUser = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const registerUser = async (email, password, userData) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  // Add user profile to Firestore
  await addDoc(collection(db, 'users'), {
    uid: userCredential.user.uid,
    email: email,
    ...userData,
    createdAt: serverTimestamp()
  });
  return userCredential;
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Meals
export const addMeal = async (mealData) => {
  return await addDoc(collection(db, 'meals'), {
    ...mealData,
    createdAt: serverTimestamp()
  });
};

export const getMeals = async () => {
  const snapshot = await getDocs(collection(db, 'meals'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateMeal = async (mealId, updates) => {
  const mealRef = doc(db, 'meals', mealId);
  return await updateDoc(mealRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const incrementMealQuantity = async (mealId, incrementBy) => {
  try {
    // First get the current meal data
    const mealRef = doc(db, 'meals', mealId);
    const mealDoc = await getDoc(mealRef);
    
    if (!mealDoc.exists()) {
      throw new Error('Meal not found');
    }
    
    const currentMeal = mealDoc.data();
    
    // Update both total and available quantities
    await updateDoc(mealRef, {
      total: currentMeal.total + incrementBy,
      available: currentMeal.available + incrementBy,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error incrementing meal quantity:', error);
    throw error;
  }
};

export const deleteMeal = async (mealId) => {
  const mealRef = doc(db, 'meals', mealId);
  return await deleteDoc(mealRef);
};

// Orders
export const createOrder = async (orderData) => {
  return await addDoc(collection(db, 'orders'), {
    ...orderData,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
};

// Create order and update meal availability
export const createOrderAndUpdateMeal = async (orderData) => {
  try {
    // First get the current meal data
    const mealRef = doc(db, 'meals', orderData.mealId);
    const mealDoc = await getDoc(mealRef);
    
    if (!mealDoc.exists()) {
      throw new Error('Meal not found');
    }
    
    const currentMeal = mealDoc.data();
    
    if (currentMeal.available <= 0) {
      throw new Error('Meal is not available');
    }

    // Generate a unique QR code data
    const qrData = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the order
    const orderRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      qrCode: qrData,
      verified: false,
      createdAt: serverTimestamp(),
      status: 'pending'
    });

    // Update meal availability (reduce by 1)
    await updateDoc(mealRef, {
      available: currentMeal.available - 1,
      updatedAt: serverTimestamp()
    });

    return orderRef;
  } catch (error) {
    console.error('Error creating order and updating meal:', error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getAllOrders = async () => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const updateOrderStatus = async (orderId, status) => {
  const orderRef = doc(db, 'orders', orderId);
  return await updateDoc(orderRef, {
    status: status,
    updatedAt: serverTimestamp()
  });
};

// Verify QR code and mark order as verified
export const verifyQRCode = async (qrData) => {
  try {
    const q = query(collection(db, 'orders'), where('qrCode', '==', qrData));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      throw new Error('Invalid QR code');
    }
    
    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();
    
    if (orderData.verified) {
      throw new Error('QR code already verified');
    }
    
    if (orderData.status !== 'paid') {
      throw new Error('Order must be paid before verification');
    }
    
    // Mark as verified
    await updateDoc(doc(db, 'orders', orderDoc.id), {
      verified: true,
      verifiedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      success: true,
      order: {
        id: orderDoc.id,
        ...orderData
      }
    };
  } catch (error) {
    console.error('Error verifying QR code:', error);
    throw error;
  }
};

// Settings
export const updateSettings = async (settingsData) => {
  try {
    // First check if any settings document exists
    const settingsSnapshot = await getDocs(collection(db, 'settings'));
    
    if (settingsSnapshot.empty) {
      // No settings exist, create a new document
      return await addDoc(collection(db, 'settings'), {
        ...settingsData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      // Update the first settings document found
      const firstSettingsDoc = settingsSnapshot.docs[0];
      const settingsRef = doc(db, 'settings', firstSettingsDoc.id);
      return await updateDoc(settingsRef, {
        ...settingsData,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};

export const getSettings = async () => {
  const snapshot = await getDocs(collection(db, 'settings'));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Initialize app with default data
export const initializeDefaultData = async () => {
  try {
    // Check if meals exist
    const mealsSnapshot = await getDocs(collection(db, 'meals'));
    if (mealsSnapshot.empty) {
      // Add default meals
      const defaultMeals = [
        { name: 'Meals', price: 40, available: 150, total: 200 },
        { name: 'Chai', price: 10, available: 150, total: 200 },
        { name: 'Samosa', price: 8, available: 150, total: 200 }
      ];
      
      for (const meal of defaultMeals) {
        await addMeal(meal);
      }
    }

    // Check if settings exist
    const settingsSnapshot = await getDocs(collection(db, 'settings'));
    if (settingsSnapshot.empty) {
      // Add default settings
      await addDoc(collection(db, 'settings'), {
        closeTime: '10:15',
        createdAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};

// Real-time listeners
export const listenToMeals = (callback) => {
  return onSnapshot(collection(db, 'meals'), (snapshot) => {
    const meals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(meals);
  });
};

export const listenToOrders = (callback) => {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(orders);
  });
};