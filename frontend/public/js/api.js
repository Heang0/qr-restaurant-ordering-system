const API_BASE_URL = 'https://qr-restaurant-ordering-system.onrender.com/api';

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
        const finalUrl = `${API_BASE_URL}${url.startsWith('/') ? url : '/' + url}`;
        const response = await fetch(finalUrl, config);
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
        // ADDED THIS LINE: New API call to get store by slug
        getStoreBySlug: (slug) => request(`/stores/public/${slug}`),
    },
    menu: {
        getMenu: (storeId) => request(`/menu?storeId=${storeId}`), // Admin access
        getPublicMenu: (storeId) => request(`/menu/public?storeId=${storeId}`), // No auth
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
        getStoreOrders: () => request('/orders'),
        updateOrderStatus: (id, status) => request(`/orders/${id}`, 'PUT', { status }),
        clearTableOrders: (tableId) => request(`/orders/table/${tableId}`, 'DELETE'),
        getCustomerOrders: (storeId, tableId) => request(`/orders/customer?storeId=${storeId}&tableId=${tableId}`),
    },
    categories: {
        getCategories: (storeId) => request(`/categories?storeId=${storeId}`),
        addCategory: (data) => request('/categories', 'POST', data),
        updateCategory: (id, data) => request(`/categories/${id}`, 'PUT', data),
        deleteCategory: (id) => request(`/categories/${id}`, 'DELETE'),
    },
};

export default api;