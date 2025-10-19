/**
 * Utility functions for authentication
 */

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: string | FormData;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

/**
 * Makes an authenticated API request with the token from localStorage
 * 
 * @param url - API endpoint URL
 * @param options - Request options
 * @returns The response data
 */
export const authenticatedRequest = async (
  url: string, 
  options: RequestOptions = {}
) => {
  // Get token from localStorage
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Authentication token missing. Please log in again.');
  }
  
  const headers: HeadersInit = {
    ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };
  
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
    body: options.body
  };
  
  console.log(`Making ${requestOptions.method} request to ${url} with auth token`);
  
  const response = await fetch(url, requestOptions);
  const responseData = await response.json();
  
  if (!response.ok) {
    // Check for authentication errors
    if (response.status === 401) {
      console.error('Authentication error:', responseData.message);
      
      // Clear token if it's invalid
      if (responseData.message.includes('Invalid token') || 
          responseData.message.includes('expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      throw new Error(responseData.message || 'Authentication failed');
    }
    
    throw new Error(responseData.message || `Error ${response.status}: Request failed`);
  }
  
  return responseData;
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
}; 