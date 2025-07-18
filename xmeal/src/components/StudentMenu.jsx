import React, { useState, useEffect } from 'react';
import { User, Clock, ShoppingCart, AlertCircle, Plus, Minus, Home, History } from 'lucide-react';

const StudentMenuPage = () => {
  const [currentUser] = useState({ name: 'John Doe', rollNo: 'CS21001' });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cart, setCart] = useState([]);
  const [cutoffTime] = useState(new Date().setHours(10, 15, 0, 0));
  
  const [menuItems] = useState([
    { id: 1, name: 'Vegetarian Meal', price: 45, category: 'Main Course', available: true },
    { id: 2, name: 'Non-Veg Meal', price: 65, category: 'Main Course', available: true },
    { id: 3, name: 'South Indian Combo', price: 40, category: 'Main Course', available: true },
    { id: 4, name: 'Samosa', price: 15, category: 'Snacks', available: true },
    { id: 5, name: 'Tea', price: 10, category: 'Beverages', available: true },
    { id: 6, name: 'Coffee', price: 15, category: 'Beverages', available: true },
    { id: 7, name: 'Fresh Juice', price: 25, category: 'Beverages', available: true },
    { id: 8, name: 'Sandwich', price: 35, category: 'Snacks', available: true }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const isOrderingAllowed = () => {
    const now = new Date();
    const todayCutoff = new Date();
    todayCutoff.setHours(10, 15, 0, 0);
    return now <= todayCutoff;
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.id !== itemId));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleLogout = () => {
    alert('Logged out successfully!');
    // In production, redirect to login page
  };

  const navigateToCart = () => {
    alert('Navigating to cart page...');
  };

  const navigateToHistory = () => {
    alert('Navigating to order history...');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-between">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">College Canteen</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{currentUser.name}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
              <Home className="w-4 h-4" />
              <span>Menu</span>
            </button>
            <button 
              onClick={navigateToCart}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart ({cart.length})</span>
            </button>
            <button 
              onClick={navigateToHistory}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg font-medium"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Cart Summary (Mobile) */}
        {cart.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 md:hidden">
            <div className="flex justify-between items-center">
              <span className="text-green-800 font-medium">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items in cart
              </span>
              <span className="text-green-600 font-bold">₹{getTotalAmount()}</span>
            </div>
            <button
              onClick={navigateToCart}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              View Cart
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Today's Menu</h2>
            <div className="text-sm text-gray-600">
              Cutoff: 10:15 AM
              {!isOrderingAllowed() && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded">
                  Ordering Closed
                </span>
              )}
            </div>
          </div>

          {!isOrderingAllowed() && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-600 mr-3" />
                <p className="text-orange-800">
                  Pre-ordering is closed for today. Orders must be placed before 10:15 AM.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map(item => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <span className="text-lg font-bold text-green-600">₹{item.price}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{item.category}</p>
                
                {item.available && isOrderingAllowed() ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Available</span>
                    <div className="flex items-center space-x-2">
                      {cart.find(cartItem => cartItem.id === item.id) ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium w-8 text-center">
                            {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-red-600">
                    {!item.available ? 'Not Available' : 'Ordering Closed'}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Cart Summary */}
        {cart.length > 0 && (
          <div className="hidden md:block mt-6 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cart Summary</h3>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.name} x{item.quantity}</span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-800">Total</span>
                <span className="text-xl font-bold text-green-600">₹{getTotalAmount()}</span>
              </div>
              <button
                onClick={navigateToCart}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Go to Cart
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentMenuPage;