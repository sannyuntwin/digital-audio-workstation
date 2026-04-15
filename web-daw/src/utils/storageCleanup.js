/**
 * Storage Cleanup Utility
 * Handles corrupted localStorage data and provides safe parsing
 */

export const safeJSONParse = (str, defaultValue = null) => {
  if (str === null || str === undefined || str === '') return defaultValue;
  
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return defaultValue;
  }
};

export const clearAuthStorage = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Auth storage cleared');
  } catch (error) {
    console.error('Failed to clear auth storage:', error);
  }
};

export const clearProjectStorage = () => {
  try {
    localStorage.removeItem('daw_project');
    console.log('Project storage cleared');
  } catch (error) {
    console.error('Failed to clear project storage:', error);
  }
};

export const clearAllStorage = () => {
  try {
    clearAuthStorage();
    clearProjectStorage();
    console.log('All storage cleared');
  } catch (error) {
    console.error('Failed to clear all storage:', error);
  }
};

// Auto-cleanup on load if corrupted data detected
export const initializeStorage = () => {
  try {
    // Test if we can read existing data
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const projectStr = localStorage.getItem('daw_project');
    
    // Validate each item
    if (token && (typeof token !== 'string' || token.length === 0)) {
      clearAuthStorage();
    }
    
    if (userStr) {
      safeJSONParse(userStr);
    }
    
    if (projectStr) {
      safeJSONParse(projectStr);
    }
  } catch (error) {
    console.error('Storage initialization failed, clearing all data:', error);
    clearAllStorage();
  }
};
