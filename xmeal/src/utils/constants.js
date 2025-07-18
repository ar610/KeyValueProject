// src/utils/constants.js

/**
 * Global constants for the XMeal application.
 * Centralized here for easy management and updates.
 */

// Application Name
export const APP_NAME = "XMeal";

// Admin User Email - Used to identify the administrator account.
// IMPORTANT: In a real production app, consider more robust role management
// rather than hardcoding admin emails directly in client-side code.
export const ADMIN_EMAIL = "admin@xmeal.com";

// Default Canteen Closing Time for Meal Booking (in HH:MM format)
// This can be overridden by settings stored in Firestore.
export  const DEFAULT_CLOSE_TIME = "10:15";

// Other potential constants you might add later:
// export const API_BASE_URL = "https://api.yourdomain.com";
// export const MEAL_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snacks"];
// export const ORDER_STATUSES = ["pending", "paid", "cancelled", "delivered"];