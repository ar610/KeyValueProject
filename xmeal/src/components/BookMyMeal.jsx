// src/components/BookMyMeal.jsx

import React, { useState } from 'react';
import { LogOut } from 'lucide-react'; // Assuming you have lucide-react for icons
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper, CardWrapper } from './common/Wrappers'; // Assuming these are in place

const BookMyMeal = ({ setCurrentView, meals, createOrder, closeTime, user, error, setError, loading, setLoading }) => {
  const [selectedMeals, setSelectedMeals] = useState({});
  const { logout } = useAuth(); // Get logout function from AuthContext

  const handleBookNow = async () => {
    // Filter for truly selected meals (checkbox is true AND meal is available)
    const mealsToBook = meals.filter(meal => selectedMeals[meal.id] && meal.available > 0);

    if (mealsToBook.length === 0) {
      setError('Please select at least one available meal to book.');
      return;
    }

    try {
      setLoading(true); // Indicate loading for the booking process
      setError(''); // Clear previous errors

      for (const meal of mealsToBook) {
        await createOrder({
          mealId: meal.id,
          mealName: meal.name,
          price: meal.price,
          userId: user.uid,
          userEmail: user.email,
          // createdAt and status will be set by the service
        });
      }

      setSelectedMeals({}); // Clear selections after successful booking
      setCurrentView('orders'); // Navigate to orders page
    } catch (err) {
      console.error('Error booking meals:', err);
      setError('Failed to book meals. Please try again.');
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <ScreenWrapper className="p-4">
      <CardWrapper className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Book My Meal</h1>
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-700"
            aria-label="Logout" // Accessibility
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 mb-2">
            *Booking will close daily at <strong className="text-blue-700">{closeTime} IST</strong>.
          </p>
          <p className="text-sm text-gray-600">
            Select the meals you wish to book for today.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto"> {/* Added max-h and overflow for scroll */}
          {meals.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No meals available for booking today.</p>
          ) : (
            meals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedMeals[meal.id] || false}
                    onChange={(e) => setSelectedMeals(prev => ({
                      ...prev,
                      [meal.id]: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    disabled={meal.available <= 0} // Disable if out of stock
                  />
                  <div>
                    <span className="font-medium">{meal.name}</span>
                    <p className="text-sm text-gray-600">${meal.price.toFixed(2)}</p> {/* Format price */}
                  </div>
                </div>
                <span className={`text-sm font-semibold ${meal.available <= 0 ? 'text-red-500' : 'text-gray-700'}`}>
                  {meal.available <= 0 ? 'Out of Stock' : `${meal.available} left`}
                </span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handleBookNow}
          disabled={loading || meals.length === 0 || Object.values(selectedMeals).every(val => !val)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Booking Meals...' : 'Book Selected Meals'}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => setCurrentView('orders')}
            className="text-blue-600 hover:underline px-4 py-2"
          >
            View My Bookings
          </button>
        </div>
      </CardWrapper>
    </ScreenWrapper>
  );
};

export default BookMyMeal;