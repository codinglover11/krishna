/**
 * Formats a number to currency string (Rupees by default)
 * @param {number} amount 
 * @param {string} currencySymbol 
 * @returns {string}
 */
export const formatCurrency = (amount, currencySymbol = "₹") => {
  if (amount === undefined || amount === null) amount = 0;
  return `${currencySymbol}${parseFloat(amount).toFixed(2)}`;
};

/**
 * Formats date string to user-friendly format
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Calculates final price after discount
 * @param {number} price 
 * @param {number} discountPercentage 
 * @returns {number}
 */
export const calculateDiscountPrice = (price, discountPercentage) => {
  if (!discountPercentage) return price;
  const discountAmount = (price * discountPercentage) / 100;
  return price - discountAmount;
};

/**
 * Generates a unique alphanumeric ID
 * @param {string} prefix 
 * @returns {string}
 */
export const generateId = (prefix = "") => {
  return `${prefix}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

/**
 * Simulates a delay for API interaction
 * @param {number} ms 
 * @returns {Promise}
 */
export const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));
