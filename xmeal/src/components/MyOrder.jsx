// src/components/MyOrder.jsx

import React from 'react';
import { LogOut, CheckCircle, XCircle, QrCode } from 'lucide-react'; // Added QrCode icon for the QR section
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper, CardWrapper } from './common/Wrappers';

const MyOrder = ({ setCurrentView, orders, user }) => {
  const { logout } = useAuth(); // Get logout function from AuthContext

  // Filter orders specific to the logged-in user
  // Ensure 'user' and 'user.uid' are available before filtering
  const userOrders = orders.filter(order => order.userId === user?.uid);

  // Helper function to format date/time
  const formatOrderTimestamp = (timestamp) => {
    // Check if timestamp is a Firebase Timestamp object or an ISO string
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } else if (timestamp && typeof timestamp === 'string') {
      // Assuming it's an ISO string from mock data or initial setup
      return new Date(timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    }
    return 'N/A';
  };

  return (
    <ScreenWrapper className="p-4">
      <CardWrapper className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        <div className="flex justify-between mb-6">
          <button
            onClick={() => setCurrentView('booking')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            aria-label="Book More Meals"
          >
            Book More
          </button>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">My Bookings</h1> {/* Changed to Bookings for consistency */}

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max-height and scroll for many orders */}
          {userOrders.length === 0 ? (
            <p className="text-center text-gray-500 py-4">You haven't booked any meals yet.</p>
          ) : (
            userOrders.map(order => (
              <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
                <div className="mb-2 sm:mb-0">
                  <span className="font-medium text-lg text-gray-800">{order.mealName}</span>
                  <p className="text-sm text-gray-600">Price: ${order.price.toFixed(2)}</p>
                  {order.createdAt && (
                    <p className="text-xs text-gray-500">Booked on: {formatOrderTimestamp(order.createdAt)}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center justify-center">
                    <QrCode className="h-6 w-6 text-gray-600" aria-label="QR Code icon" />
                    <span className="text-xs text-gray-600">QR</span>
                  </div>
                  {order.status === 'paid' ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-6 w-6 mr-1" aria-label="Paid status icon" />
                      <span className="font-semibold text-sm">Paid</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-6 w-6 mr-1" aria-label="Pending status icon" />
                      <span className="font-semibold text-sm">Pending</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setCurrentView('verify')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            aria-label="Verify Payment"
          >
            Verify Payment
          </button>
        </div>
      </CardWrapper>
    </ScreenWrapper>
  );
};

export default MyOrder;