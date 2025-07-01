// Change the API_BASE_URL to a relative path
// When deployed as a single service, the frontend is served from the same domain
// as the backend API. So, '/api' will correctly point to the backend routes.
const API_BASE_URL = '/api'; 

async function request(url, method = 'GET', data = null, isFormData = false) {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers: { ...headers },
    };

    if (!isFormData) {
        config.headers['Content-Type'] = 'application/json';
    }
    
    if (data) {
        config.body = isFormData ? data : JSON.stringify(data);
    }

    try {
        // Use API_BASE_URL directly, it's now relative to the server's root
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        const responseData = await response.json();

        if (!response.ok) {
            const error = new Error(responseData.message || 'Something went wrong');
            error.statusCode = response.status;
            throw error;
        }
        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Export specific API functions
const api = {
    auth: {
        login: (email, password) => request('/auth/login', 'POST', { email, password }),
    },
    users: {
        createAdmin: (userData) => request('/users', 'POST', userData),
        getAdmins: () => request('/users'),
        deleteAdmin: (id) => request(`/users/${id}`, 'DELETE'),
        updateAdmin: (id, userData) => request(`/users/${id}`, 'PUT', userData),
    },
    stores: {
        createStore: (name) => request('/stores', 'POST', { name }),
        getStores: () => request('/stores'),
        updateStore: (id, formData) => request(`/stores/${id}`, 'PUT', formData, true),
        getStoreById: (id) => request(`/stores/${id}`),
    },
    menu: {
        // Note: The backend's /menu/public endpoint is still useful if you ever decide
        // to separate frontend hosting again, but for a single service, /menu?storeId=...
        // would work for both admin and public if not using authentication middleware.
        // However, sticking to the public endpoint for customers is safer.
        getMenu: (storeId) => request(`/menu?storeId=${storeId}`), // This is for admin
        addMenuItem: (formData) => request('/menu', 'POST', formData, true),
        updateMenuItem: (id, formData) => request(`/menu/${id}`, 'PUT', formData, true),
        deleteMenuItem: (id) => request(`/menu/${id}`, 'DELETE'),
    },
    tables: {
        getTables: (storeId) => request(`/tables?storeId=${storeId}`),
        addTable: (data) => request('/tables', 'POST', data),
        deleteTable: (id) => request(`/tables/${id}`, 'DELETE'),
    },
    orders: {
        placeOrder: (orderData) => request('/orders', 'POST', orderData),
        getStoreOrders: () => request('/orders'), // Admin orders
        updateOrderStatus: (id, status) => request(`/orders/${id}`, 'PUT', { status }),
        clearTableOrders: (tableId) => request(`/orders/table/${tableId}`, 'DELETE'),
        // Customer orders endpoint now uses the relative API_BASE_URL
        getCustomerOrders: (storeId, tableId) => request(`/orders/customer?storeId=${storeId}&tableId=${tableId}`),
    },
    categories: {
        getCategories: (storeId) => request(`/categories?storeId=${storeId}`),
        addCategory: (data) => request('/categories', 'POST', data),
        updateCategory: (id, data) => request(`/categories/${id}`, 'PUT', data), 
        deleteCategory: (id) => request(`/categories/${id}`, 'DELETE'),
    }
};

window.api = api;
