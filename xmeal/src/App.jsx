import React, { useState, useEffect } from 'react';
import { Camera, Plus, Clock, Users, DollarSign, CheckCircle, XCircle, LogOut, QrCode, Trash2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import QrScanner from 'qr-scanner';
import { 
  getMeals, 
  addMeal, 
  updateMeal, 
  incrementMealQuantity,
  deleteMeal,
  createOrder, 
  createOrderAndUpdateMeal,
  getAllOrders, 
  updateOrderStatus,
  getSettings,
  updateSettings,
  verifyQRCode,
  listenToMeals,
  listenToOrders,
  initializeDefaultData
} from './services/firebaseService';

const ScreenWrapper = ({ children, className = '' }) => (
  <div className={`min-h-screen w-screen bg-gray-50 ${className}`}>
    {children}
  </div>
);

const CardWrapper = ({ children, className = '' }) => (
  <div className={`w-full h-full p-0 ${className}`}>
    {children}
  </div>
);

const XMealApp = () => {
  //set current view
  const [currentView, setCurrentView] = useState('booking');
  //set loading state
  const [loading, setLoading] = useState(false);
  //set orders
  const [orders, setOrders] = useState([]);
  //set meals
  const [meals, setMeals] = useState([]);
  //set closetime
  const [closeTime, setCloseTime] = useState('10:15');
  //select meal
  const [selectedMeals, setSelectedMeals] = useState({});
  //user id for tracking (since we don't have auth) - persist in localStorage
  const [userId] = useState(() => {
    let storedUserId = localStorage.getItem('xmeal_userId');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}`;
      localStorage.setItem('xmeal_userId', storedUserId);
    }
    return storedUserId;
  });
  // QR Code states
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanResult, setScanResult] = useState('');
  
  const [error, setError] = useState('');  // Initialize Firebase listeners and load data
  useEffect(() => {
    const initializeApp = async () => {
      // Initialize default data if needed
      await initializeDefaultData();
      
      // Load initial data
      await loadData();
      
      // Set up real-time listeners
      const unsubscribeMeals = listenToMeals((mealsData) => {
        setMeals(mealsData);
      });
      
      const unsubscribeOrders = listenToOrders((ordersData) => {
        setOrders(ordersData);
      });

      return () => {
        unsubscribeMeals();
        unsubscribeOrders();
      };
    };

    initializeApp();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load meals
      const mealsData = await getMeals();
      setMeals(mealsData);

      // Load orders
      const ordersData = await getAllOrders();
      setOrders(ordersData);

      // Load settings
      try {
        const settingsData = await getSettings();
        if (settingsData.length > 0) {
          setCloseTime(settingsData[0].closeTime || '10:15');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        // Don't fail the entire load process if settings fail
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Since we don't have authentication, just reset to booking view
    setCurrentView('booking');
    setSelectedMeals({});
    setError('');
  };

  const addMealToDatabase = async (mealData) => {
    try {
      const docRef = await addMeal(mealData);
      setError('');
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Failed to add meal');
    }
  };

  const updateMealInDatabase = async (mealId, updates) => {
    try {
      await updateMeal(mealId, updates);
      setError('');
    } catch (error) {
      console.error('Error updating meal:', error);
      setError('Failed to update meal');
    }
  };

  const incrementMealQuantityInDatabase = async (mealId, incrementBy) => {
    try {
      await incrementMealQuantity(mealId, incrementBy);
      setError('');
    } catch (error) {
      console.error('Error incrementing meal quantity:', error);
      setError('Failed to increment meal quantity');
    }
  };

  const deleteMealFromDatabase = async (mealId, mealName) => {
    try {
      if (window.confirm(`Are you sure you want to delete "${mealName}"? This action cannot be undone.`)) {
        await deleteMeal(mealId);
        setError('');
        alert(`"${mealName}" has been deleted successfully.`);
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal');
    }
  };

  const createOrderInDatabase = async (orderData) => {
    try {
      const docRef = await createOrderAndUpdateMeal({
        ...orderData,
        userId: userId // Use our generated userId
      });
      
      setError('');
      return docRef;
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.message === 'Meal is not available') {
        setError('Sorry, this meal is no longer available');
      } else {
        setError('Failed to create order');
      }
      throw error;
    }
  };

  const updateOrderStatusInDatabase = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setError('');
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  // QR Code Modal Component
  const QRModal = ({ qrCode, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">Order QR Code</h3>
          <p className="text-sm text-gray-600 mb-2">Show this QR code to the admin for verification</p>
          <p className="text-xs text-orange-600">
            ⚠️ Order will be removed from your list once verified
          </p>
        </div>
        <div className="flex justify-center mb-4 bg-white p-4 rounded">
          <QRCode value={qrCode} size={200} />
        </div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );

  // QR Scanner Component
  const QRScannerModal = ({ onClose, onScan }) => {
    const [scanning, setScanning] = useState(false);
    const videoRef = React.useRef(null);

    useEffect(() => {
      let qrScanner = null;

      const startScanning = async () => {
        try {
          if (videoRef.current) {
            qrScanner = new QrScanner(
              videoRef.current,
              (result) => {
                onScan(result.data);
                setScanning(false);
              },
              {
                onDecodeError: (error) => {
                  console.log('QR decode error:', error);
                },
                highlightScanRegion: true,
                highlightCodeOutline: true,
              }
            );
            
            await qrScanner.start();
            setScanning(true);
          }
        } catch (error) {
          console.error('Error starting QR scanner:', error);
          setError('Failed to start camera');
        }
      };

      startScanning();

      return () => {
        if (qrScanner) {
          qrScanner.stop();
          qrScanner.destroy();
        }
      };
    }, [onScan]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
            <p className="text-sm text-gray-600">Point camera at QR code to verify order</p>
          </div>
          <div className="mb-4">
            <video
              ref={videoRef}
              className="w-full rounded"
              style={{ maxHeight: '300px' }}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
          {scanning && (
            <p className="text-center text-sm text-green-600 mt-2">Camera active - point at QR code</p>
          )}
        </div>
      </div>
    );
  };

  // Book My Meal Component
  const BookMyMeal = () => (
    <ScreenWrapper className="p-4">
      <CardWrapper className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Book My Meal</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('admin')}
              className="text-white hover:text-gray-300 text-sm"
            >
              Admin
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">*Booking will close at {closeTime} am</p>
          <p className="text-sm text-gray-600">Available</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {meals.map(meal => (
            <div key={meal.id} className={`flex items-center justify-between text-black p-3 rounded-lg ${
              meal.available > 0 ? 'bg-gray-100' : 'bg-gray-200 opacity-60'
            }`}>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedMeals[meal.id] || false}
                  onChange={(e) => setSelectedMeals(prev => ({
                    ...prev,
                    [meal.id]: e.target.checked
                  }))}
                  disabled={meal.available === 0}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className={`font-medium ${meal.available === 0 ? 'text-gray-500' : ''}`}>
                  {meal.name} (${meal.price})
                  {meal.available === 0 && <span className="text-red-500 ml-2">(Sold Out)</span>}
                </span>
              </div>
              <span className={`text-sm ${meal.available === 0 ? 'text-red-500' : 'text-gray-600'}`}>
                {meal.available}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={async () => {
            const selectedMealIds = Object.keys(selectedMeals).filter(id => selectedMeals[id]);
            
            if (selectedMealIds.length === 0) {
              setError('Please select at least one meal');
              return;
            }

            // Check if all selected meals are still available
            const unavailableMeals = selectedMealIds.filter(mealId => {
              const meal = meals.find(m => m.id === mealId);
              return !meal || meal.available === 0;
            });

            if (unavailableMeals.length > 0) {
              setError('Some selected meals are no longer available. Please refresh and try again.');
              return;
            }

            try {
              setLoading(true);
              setError('');
              
              let successCount = 0;
              let failCount = 0;
              
              for (const mealId of selectedMealIds) {
                try {
                  const meal = meals.find(m => m.id === mealId);
                  await createOrderInDatabase({
                    mealId: meal.id,
                    mealName: meal.name,
                    price: meal.price
                  });
                  successCount++;
                } catch (error) {
                  failCount++;
                  console.error(`Failed to book ${meal.name}:`, error);
                }
              }

              setSelectedMeals({});
              
              if (successCount > 0 && failCount === 0) {
                setCurrentView('orders');
              } else if (successCount > 0 && failCount > 0) {
                setError(`${successCount} meals booked successfully, ${failCount} failed. Some meals may have become unavailable.`);
              } else {
                setError('Failed to book any meals. They may have become unavailable.');
              }
            } catch (error) {
              console.error('Error booking meals:', error);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Booking...' : 'Book Now'}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentView('orders')}
            className="text-white hover:underline"
          >
            View My Orders
          </button>
        </div>
      </CardWrapper>
    </ScreenWrapper>
  );

  // My Order Component
  const MyOrder = () => {
    // Filter out verified orders so they don't appear in the list
    const userOrders = orders.filter(order => order.userId === userId && !order.verified);

    return (
      <ScreenWrapper className="p-4">
        <CardWrapper className="bg-white text-black shadow-lg rounded-lg p-6 max-w-md mx-auto">
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setCurrentView('booking')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Book More
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-center mb-6">My Orders</h1>

          <div className="space-y-4">
            {userOrders.length === 0 ? (
              <p className="text-center text-gray-500">No pending orders</p>
            ) : (
              userOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between text-black bg-gray-100 p-3 rounded-lg">
                  <div>
                    <span className="font-medium">{order.mealName}</span>
                    <p className="text-sm text-gray-600">${order.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.status === 'paid' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedQRCode(order.qrCode);
                            setShowQRModal(true);
                          }}
                          className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 flex items-center space-x-1"
                          title="Show QR Code for verification"
                        >
                          <QrCode className="h-3 w-3" />
                          <span>QR</span>
                        </button>
                        <span className="text-sm text-green-600 font-medium">Paid</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={async () => {
                            try {
                              await updateOrderStatusInDatabase(order.id, 'paid');
                              alert('Payment successful!');
                            } catch (error) {
                              console.error('Error updating payment status:', error);
                              setError('Failed to process payment');
                            }
                          }}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Pay
                        </button>
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Information about verified orders */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ℹ️ Verified orders are automatically removed from this list
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                // Update all pending orders for this user to paid
                try {
                  setLoading(true);
                  const pendingOrders = userOrders.filter(order => order.status === 'pending');
                  
                  if (pendingOrders.length === 0) {
                    setError('No pending orders to pay for');
                    return;
                  }

                  for (const order of pendingOrders) {
                    await updateOrderStatusInDatabase(order.id, 'paid');
                  }
                  
                  setError('');
                  alert(`Payment successful! ${pendingOrders.length} order(s) marked as paid.`);
                } catch (error) {
                  console.error('Error updating payment status:', error);
                  setError('Failed to process payment');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || userOrders.filter(order => order.status === 'pending').length === 0}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : `Pay All Pending (${userOrders.filter(order => order.status === 'pending').length})`}
            </button>
            
            {userOrders.filter(order => order.status === 'pending').length === 0 && userOrders.length > 0 && (
              <p className="text-sm text-gray-500 mt-2">All orders have been paid</p>
            )}
          </div>
        </CardWrapper>
      </ScreenWrapper>
    );
  };

  // Verify Component
  const Verify = () => {
    const handleQRScan = async (qrData) => {
      try {
        setLoading(true);
        setShowQRScanner(false);
        
        const result = await verifyQRCode(qrData);
        setScanResult(`✓ Order verified successfully!\nMeal: ${result.order.mealName}\nPrice: $${result.order.price}`);
        setError('');
      } catch (error) {
        console.error('Error verifying QR code:', error);
        setScanResult('');
        setError(`Verification failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    return (
      <ScreenWrapper className="p-4">
        <CardWrapper className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setCurrentView('admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Admin
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>

          <h1 className="text-2xl font-bold text-center mb-6">Verify Orders</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {scanResult && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
              {scanResult}
            </div>
          )}

          <div className="bg-gray-100 rounded-lg p-8 mb-6 text-center">
            <Camera className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600 mb-4">Scan customer QR code to verify order</p>
            <button
              onClick={() => setShowQRScanner(true)}
              disabled={loading}
              className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Start Scanning'}
            </button>
          </div>

          {showQRScanner && (
            <QRScannerModal
              onClose={() => setShowQRScanner(false)}
              onScan={handleQRScan}
            />
          )}

          <div className="text-center text-sm text-gray-600">
            <p>• QR codes can only be verified once</p>
            <p>• Orders must be paid before verification</p>
          </div>
        </CardWrapper>
      </ScreenWrapper>
    );
  };

  // Admin Dashboard Component
  const AdminDashboard = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
    const recentOrders = orders.slice(-10);

    return (
      <ScreenWrapper className="p-4">
        <CardWrapper className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('verify')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Verify Orders
              </button>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-gray-600">Close Time</p>
              <p className="text-2xl font-bold text-yellow-600">{closeTime}</p>
            </div>
          </div>

          {/* Meals Management */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Manage Meals</h3>
            <div className="space-y-3">
              {meals.map(meal => (
                <div key={meal.id} className="flex items-center justify-between text-black bg-gray-50 p-3 rounded-lg">
                  <div>
                    <span className="font-medium">{meal.name}</span>
                    <span className="text-gray-600 ml-2">(${meal.price})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{meal.available}</span>
                    <button
                      onClick={() => {
                        const newAvailable = prompt(`Change availability for ${meal.name}:`, meal.available);
                        if (newAvailable !== null && !isNaN(newAvailable)) {
                          updateMealInDatabase(meal.id, { available: parseInt(newAvailable) });
                        }
                      }}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                      title="Set exact availability"
                    >
                      Set Avail
                    </button>
                    <button
                      onClick={() => {
                        const addQuantity = prompt(`Add more items to ${meal.name} (this will increase both total and available):`, '10');
                        if (addQuantity !== null && !isNaN(addQuantity) && parseInt(addQuantity) > 0) {
                          incrementMealQuantityInDatabase(meal.id, parseInt(addQuantity));
                        }
                      }}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                      title="Add more items to inventory"
                    >
                      Add More
                    </button>
                    <button
                      onClick={() => deleteMealFromDatabase(meal.id, meal.name)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 flex items-center space-x-1"
                      title="Delete this meal"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => {
                  const name = prompt('Meal name:');
                  const price = prompt('Price:');
                  const total = prompt('Total quantity:');

                  if (name && price && total && !isNaN(price) && !isNaN(total)) {
                    addMealToDatabase({
                      name,
                      price: parseInt(price),
                      available: parseInt(total),
                      total: parseInt(total)
                    });
                  }
                }}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                Add New Meal
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="mb-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Close Time:</label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 text-black focus:ring-blue-500"
              />
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    await updateSettings({ closeTime });
                    setError('');
                    alert('Close time updated successfully!');
                  } catch (error) {
                    console.error('Error updating settings:', error);
                    setError(`Failed to update close time: ${error.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No orders yet</p>
              ) : (
                recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium">{order.mealName}</span>
                      <p className="text-sm text-gray-600">Order #{order.id}</p>
                      {order.verified && (
                        <p className="text-xs text-green-600 font-medium">✓ Verified</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">${order.price}</span>
                      <button
                        onClick={() => {
                          const newStatus = order.status === 'paid' ? 'pending' : 'paid';
                          updateOrderStatusInDatabase(order.id, newStatus);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          order.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status === 'paid' ? 'Paid' : 'Pending'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardWrapper>
      </ScreenWrapper>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper className="flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </ScreenWrapper>
    );
  }

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'booking':
        return <BookMyMeal />;
      case 'orders':
        return <MyOrder />;
      case 'verify':
        return <Verify />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <BookMyMeal />;
    }
  };

  return (
    <div className="w-screen min-h-screen font-sans overflow-x-hidden">
      {renderView()}
      
      {/* QR Code Modal */}
      {showQRModal && (
        <QRModal
          qrCode={selectedQRCode}
          onClose={() => {
            setShowQRModal(false);
            setSelectedQRCode('');
          }}
        />
      )}
    </div>
  );
};

export default XMealApp;