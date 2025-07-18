// src/components/Verify.jsx

import React, { useState, useEffect } from 'react';
import { LogOut, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper, CardWrapper } from './common/Wrappers';

const Verify = ({ setCurrentView, orders, user, updateOrderStatus, setError }) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { logout } = useAuth(); // Get logout function from AuthContext

  // Clear global error message when this component mounts/unmounts
  useEffect(() => {
    setError(''); // Clear any previous errors from App.js
    setSuccessMessage(''); // Clear any previous success messages
  }, [setError]);

  // Helper function to format date/time (reused from MyOrder.jsx)
  const formatOrderTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } else if (timestamp && typeof timestamp === 'string') {
      return new Date(timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    }
    return 'N/A';
  };

  const handleVerifyOrder = () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setSelectedOrder(null); // Clear previous selection

    if (!orderIdInput.trim()) {
      setError('Please enter an Order ID.');
      setLoading(false);
      return;
    }

    const foundOrder = orders.find(order => order.id === orderIdInput.trim());

    if (foundOrder) {
      setSelectedOrder(foundOrder);
      setSuccessMessage(`Order '${foundOrder.id}' found successfully.`);
    } else {
      setError(`Order with ID '${orderIdInput.trim()}' not found.`);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder) {
      setError('No order selected to update.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateOrderStatus(selectedOrder.id, newStatus);
      // Optimistically update the selectedOrder state to reflect the change
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      setSuccessMessage(`Order '${selectedOrder.id}' successfully marked as ${newStatus}.`);
    } catch (err) {
      console.error(`Error updating order status to ${newStatus}:`, err);
      setError(`Failed to update order status. ${err.message || ''}`);
    } finally {
      setLoading(false);
    }
  };

  // Placeholder for QR code scanner logic
  // You would typically use a library like 'react-qr-reader' here.
  // Example:
  /*
  const handleScan = (data) => {
    if (data) {
      setOrderIdInput(data); // Set the scanned data as the Order ID
      // Optionally, automatically trigger verification
      // handleVerifyOrder();
    }
  };
  const handleError = (err) => {
    console.error(err);
    setError('QR Scan Error: ' + err.message);
  };
  */

  return (
    <ScreenWrapper className="p-4">
      <CardWrapper className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentView('admin')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Back to Admin Dashboard"
          >
            Back to Dashboard
          </button>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Verify Meal Order</h1>

        <p className="text-center text-gray-600 mb-6">
          Scan the QR code or manually enter the Order ID to verify a meal booking.
        </p>

        {/* Global Error/Success Message Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        {/* QR Code Scanner Placeholder */}
        <div className="bg-gray-200 h-48 flex items-center justify-center rounded-lg mb-6 text-gray-500 border-2 border-dashed border-gray-400">
          <QrCode className="h-12 w-12 text-gray-400" />
          <p className="ml-3 text-lg">QR Code Scanner Area</p>
          {/* Integrate your QR scanner component here, e.g.: */}
          {/* <QrReader
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          /> */}
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <input
            type="text"
            placeholder="Enter Order ID (e.g., aBcDeF123)"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
          <button
            onClick={handleVerifyOrder}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading || !orderIdInput.trim()}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {selectedOrder && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Order Details</h3>
            <div className="space-y-3 mb-6">
              <p className="text-gray-700"><strong>Meal:</strong> {selectedOrder.mealName}</p>
              <p className="text-gray-700"><strong>User Email:</strong> {selectedOrder.userEmail}</p>
              <p className="text-gray-700"><strong>Price:</strong> ${selectedOrder.price.toFixed(2)}</p>
              <p className="text-gray-700"><strong>Booked On:</strong> {formatOrderTimestamp(selectedOrder.createdAt)}</p>
              <div className="flex items-center">
                <strong className="text-gray-700 mr-2">Current Status:</strong>
                <span className={`font-bold text-lg ${selectedOrder.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedOrder.status.toUpperCase()}
                </span>
                {selectedOrder.status === 'paid' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 ml-2" />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => handleUpdateStatus('paid')}
                disabled={selectedOrder.status === 'paid' || loading}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                aria-label="Mark order as Paid"
              >
                Mark as Paid
              </button>
              <button
                onClick={() => handleUpdateStatus('pending')}
                disabled={selectedOrder.status === 'pending' || loading}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                aria-label="Mark order as Pending"
              >
                Mark as Pending
              </button>
            </div>
          </div>
        )}
      </CardWrapper>
    </ScreenWrapper>
  );
};

export default Verify;