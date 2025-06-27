const API_BASE_URL = 'http://localhost:5000/api'; // Use localhost for local dev

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
    },
    stores: {
        createStore: (name) => request('/stores', 'POST', { name }),
        getStores: () => request('/stores'),
        updateStore: (id, formData) => request(`/stores/${id}`, 'PUT', formData, true),
    },
    menu: {
        getMenu: (storeId) => request(`/menu?storeId=${storeId}`),
        addMenuItem: (formData) => request('/menu', 'POST', formData, true),
        updateMenuItem: (id, formData) => request(`/menu/${id}`, 'PUT', formData, true),
        deleteMenuItem: (id) => request(`/menu/${id}`, 'DELETE'),
    },
    tables: {
        getTables: (storeId) => request(`/tables?storeId=${storeId}`),
        addTable: (tableId) => request('/tables', 'POST', { tableId }),
        deleteTable: (id) => request(`/tables/${id}`, 'DELETE'),
    },
    orders: {
        placeOrder: (orderData) => request('/orders', 'POST', orderData),
        getStoreOrders: () => request('/orders'),
        updateOrderStatus: (id, status) => request(`/orders/${id}`, 'PUT', { status }),
    },
    categories: {
        getCategories: (storeId) => request(`/categories?storeId=${storeId}`),
        addCategory: (name) => request('/categories', 'POST', { name }),
        updateCategory: (id, data) => request(`/categories/${id}`, 'PUT', data), 
        deleteCategory: (id) => request(`/categories/${id}`, 'DELETE'),
    }
};

window.api = api;