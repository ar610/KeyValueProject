// src/components/AdminDashboard.jsx

import React, { useState } from 'react';
import { Clock, Users, DollarSign, LogOut } from 'lucide-react'; // Assuming you have lucide-react for icons
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper, CardWrapper } from './common/Wrappers';

const AdminDashboard = ({
  setCurrentView,
  orders,
  meals,
  closeTime,
  updateMeal,
  addMeal,
  updateOrderStatus,
  updateCloseTime, // New prop for updating the close time in Firebase
  error // Error prop from App.js
}) => {
  const { logout } = useAuth(); // Get logout function from AuthContext
  const [localCloseTime, setLocalCloseTime] = useState(closeTime); // State for the input field

  // Calculate total revenue from all orders
  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);

  // Get the last 10 orders, reversed to show newest first
  const recentOrders = orders.slice(-10).reverse();

  // Handle update close time directly from the input
  const handleCloseTimeChange = (e) => {
    const newTime = e.target.value;
    setLocalCloseTime(newTime);
    // You could immediately call updateCloseTime here,
    // or wait for a separate "Save Settings" button click.
    // For simplicity, we'll make the input's onChange trigger the update handler in App.js
    // if you want immediate save. Or add a dedicated button below it.
  };

  const handleUpdateCloseTimeClick = () => {
    if (localCloseTime) {
      updateCloseTime(localCloseTime); // Call the prop function to update in Firebase
      alert('Close time updated successfully!'); // User feedback
    } else {
      alert('Please enter a valid close time.');
    }
  };

  const handleAddMealClick = () => {
    const name = prompt('Enter meal name:');
    if (!name) {
      alert('Meal name cannot be empty.');
      return;
    }

    const priceInput = prompt('Enter price:');
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid positive price.');
      return;
    }

    const totalInput = prompt('Enter total quantity:');
    const total = parseInt(totalInput, 10);
    if (isNaN(total) || total <= 0) {
      alert('Please enter a valid positive total quantity.');
      return;
    }

    addMeal({
      name,
      price, // Use parseFloat price
      available: total,
      total: total
    });
  };

  const handleUpdateMealAvailability = (mealId, currentAvailable, mealName) => {
    const newAvailableInput = prompt(`Change availability for ${mealName}:`, currentAvailable);
    if (newAvailableInput === null) return; // User cancelled

    const newAvailable = parseInt(newAvailableInput, 10);
    if (isNaN(newAvailable) || newAvailable < 0) {
      alert('Please enter a valid non-negative number for availability.');
      return;
    }

    updateMeal(mealId, { available: newAvailable });
  };

  return (
    <ScreenWrapper className="p-4">
      <CardWrapper className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('verify')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              aria-label="Verify Orders"
            >
              Verify Orders
            </button>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700"
              aria-label="Logout"
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
          <div className="bg-blue-50 p-4 rounded-lg text-center shadow-sm">
            <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center shadow-sm">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p> {/* Format revenue */}
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center shadow-sm">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-sm text-gray-600">Close Time</p>
            <p className="text-2xl font-bold text-yellow-600">{closeTime}</p>
          </div>
        </div>

        {/* Meals Management */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Manage Meals</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2"> {/* Added scroll */}
            {meals.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No meals added yet.</p>
            ) : (
              meals.map(meal => (
                <div key={meal.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <span className="font-medium text-gray-800">{meal.name}</span>
                    <span className="text-gray-600 ml-2">(${meal.price.toFixed(2)})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Availability: <span className="font-semibold">{meal.available}/{meal.total}</span></span>
                    <button
                      onClick={() => handleUpdateMealAvailability(meal.id, meal.available, meal.name)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      aria-label={`Update availability for ${meal.name}`}
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleAddMealClick}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Add New Meal"
          >
            Add New Meal
          </button>
        </div>

        {/* Settings */}
        <div className="mb-6 border-t pt-4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Application Settings</h3>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label htmlFor="closeTimeInput" className="text-sm text-gray-600">Meal Booking Close Time:</label>
            <input
              id="closeTimeInput"
              type="time"
              value={localCloseTime}
              onChange={handleCloseTimeChange}
              className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <button
              onClick={handleUpdateCloseTimeClick}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              aria-label="Save Close Time"
            >
              Save Close Time
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Orders</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Added scroll */}
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders yet.</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <span className="font-medium text-gray-800">{order.mealName}</span>
                    <p className="text-sm text-gray-600">By: {order.userEmail}</p>
                    {order.createdAt && (
                      <p className="text-xs text-gray-500">Booked: {order.createdAt.toDate ? order.createdAt.toDate().toLocaleString() : new Date(order.createdAt).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 font-semibold">${order.price.toFixed(2)}</span>
                    <button
                      onClick={() => {
                        const newStatus = order.status === 'paid' ? 'pending' : 'paid';
                        updateOrderStatus(order.id, newStatus);
                      }}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        order.status === 'paid'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } transition-colors`}
                      aria-label={`Toggle status for ${order.mealName} to ${order.status === 'paid' ? 'Pending' : 'Paid'}`}
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

export default AdminDashboard;