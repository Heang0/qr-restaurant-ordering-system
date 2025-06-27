document.addEventListener('DOMContentLoaded', async () => {
    // --- Initial setup and authentication check ---
    if (typeof window.api === 'undefined') {
        console.error('Error: api object is not defined. Ensure api.js is loaded correctly.');
        return;
    }

    const role = localStorage.getItem('role');
    const storeId = localStorage.getItem('storeId');

    if (!localStorage.getItem('token') || role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }

    // --- DOM Element Selection ---
    const menuItemForm = document.getElementById('menuItemForm');
    const menuItemIdInput = document.getElementById('menuItemId');
    const itemNameInput = document.getElementById('itemName');
    const itemDescriptionInput = document.getElementById('itemDescription');
    const itemPriceInput = document.getElementById('itemPrice');
    const itemImageInput = document.getElementById('itemImage');
    const itemCategorySelect = document.getElementById('itemCategory');
    const currentImagePreview = document.getElementById('currentImagePreview');
    const menuItemSubmitBtn = document.getElementById('menuItemSubmitBtn');
    const menuItemMessage = document.getElementById('menuItemMessage');
    const menuItemsList = document.getElementById('menuItemsList');
    const menuListMessage = document.getElementById('menuListMessage');

    const addTableForm = document.getElementById('addTableForm');
    const newTableIdInput = document.getElementById('newTableId');
    const addTableMessage = document.getElementById('addTableMessage');
    const tablesList = document.getElementById('tablesList');
    const tablesListMessage = document.getElementById('tablesListMessage');

    const ordersDashboard = document.getElementById('ordersDashboard');
    const ordersMessage = document.getElementById('ordersMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // New category elements
    const addCategoryForm = document.getElementById('addCategoryForm');
    const categoryNameInput = document.getElementById('categoryName');
    const addCategoryMessage = document.getElementById('addCategoryMessage');
    const categoriesListDiv = document.getElementById('categoriesList');
    const categoryListMessage = document.getElementById('categoryListMessage');
    const menuCategoryFilterButtons = document.getElementById('menu-category-filter-buttons');

    // Store Branding elements
    const storeLogoForm = document.getElementById('storeLogoForm');
    const storeLogoInput = document.getElementById('storeLogo');
    const currentStoreLogoPreview = document.getElementById('currentStoreLogoPreview');
    const storeLogoMessage = document.getElementById('storeLogoMessage');

    let currentPollingInterval;
    let categories = [];
    let editingCategoryId = null;
    let allMenuItems = [];

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });
    
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = categoryNameInput.value.trim();
        if (!name) {
            addCategoryMessage.textContent = 'Category name is required.';
            addCategoryMessage.className = 'error-message';
            return;
        }
        try {
            if (editingCategoryId) {
                const data = await api.categories.updateCategory(editingCategoryId, { name });
                addCategoryMessage.textContent = data.message || 'Category updated successfully!';
            } else {
                const data = await api.categories.addCategory(name);
                addCategoryMessage.textContent = data.message || 'Category added successfully!';
            }
            addCategoryMessage.className = 'success-message';
            categoryNameInput.value = '';
            editingCategoryId = null;
            addCategoryForm.querySelector('button').textContent = 'Add Category';
            await loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            addCategoryMessage.textContent = 'Error saving category: ' + (error.message || 'Server error');
            addCategoryMessage.className = 'error-message';
        }
    });

    menuItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = menuItemIdInput.value;
        const name = itemNameInput.value.trim();
        const description = itemDescriptionInput.value.trim();
        const price = parseFloat(itemPriceInput.value);
        const imageFile = itemImageInput.files[0];
        const categoryId = itemCategorySelect.value;

        if (!name || isNaN(price) || !categoryId) {
            menuItemMessage.textContent = 'Name, Price, and Category are required.';
            menuItemMessage.className = 'error-message';
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('categoryId', categoryId);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            if (id) {
                const data = await api.menu.updateMenuItem(id, formData);
                menuItemMessage.textContent = data.message || 'Menu item updated successfully!';
            } else {
                const data = await api.menu.addMenuItem(formData);
                menuItemMessage.textContent = data.message || 'Menu item added successfully!';
            }
            menuItemMessage.className = 'success-message';
            menuItemForm.reset();
            menuItemIdInput.value = '';
            currentImagePreview.innerHTML = '';
            menuItemSubmitBtn.textContent = 'Add Menu Item';
            loadMenuItems();
        } catch (error) {
            console.error('Error saving menu item:', error);
            menuItemMessage.textContent = 'Error saving menu item: ' + (error.message || 'Server error');
            menuItemMessage.className = 'error-message';
        }
    });

    addTableForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tableId = newTableIdInput.value.trim();
        if (!tableId) {
            addTableMessage.textContent = 'Table ID is required.';
            addTableMessage.className = 'error-message';
            return;
        }
        try {
            const data = await api.tables.addTable(tableId);
            addTableMessage.textContent = data.message || 'Table added successfully!';
            addTableMessage.className = 'success-message';
            newTableIdInput.value = '';
            loadTables();
        } catch (error) {
            console.error('Error adding table:', error);
            addTableMessage.textContent = 'Error adding table: ' + (error.message || 'Server error');
            addTableMessage.className = 'error-message';
        }
    });

    storeLogoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const logoFile = storeLogoInput.files[0];
        if (!logoFile) {
            storeLogoMessage.textContent = 'Please select a logo file.';
            storeLogoMessage.className = 'error-message';
            return;
        }
        const formData = new FormData();
        formData.append('logo', logoFile);
        
        try {
            const data = await api.stores.updateStore(storeId, formData);
            storeLogoMessage.textContent = data.message || 'Logo updated successfully!';
            storeLogoMessage.className = 'success-message';
            if (data.store.logoUrl) {
                currentStoreLogoPreview.innerHTML = `<p>Current Logo:</p><img src="${data.store.logoUrl}" alt="Current Logo" style="max-width: 150px; display: block; border-radius: 8px; margin-top: 10px;">`;
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            storeLogoMessage.textContent = 'Failed to upload logo: ' + (error.message || 'Server error');
            storeLogoMessage.className = 'error-message';
        }
    });

    // --- Category Management Functions ---
    async function loadCategories() {
        try {
            categories = await api.categories.getCategories();
            
            // Populate the dropdown
            itemCategorySelect.innerHTML = '';
            if (categories.length === 0) {
                itemCategorySelect.innerHTML = '<option value="">No categories available</option>';
                categoriesListDiv.innerHTML = '<p class="empty-state">No categories added yet.</p>';
                return;
            }
            itemCategorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat._id;
                option.textContent = cat.name;
                itemCategorySelect.appendChild(option);
            });

            // Populate the list for deletion and editing
            categoriesListDiv.innerHTML = '';
            categories.forEach(cat => {
                const catCard = document.createElement('div');
                catCard.classList.add('table-card', 'category-card');
                catCard.innerHTML = `
                    <div class="table-card-header">
                        <h4 class="table-id-label">${cat.name}</h4>
                    </div>
                    <div class="table-card-actions">
                        <button class="edit-category-btn primary-btn" data-id="${cat._id}">Edit</button>
                        <button class="delete-category-btn secondary-btn" data-id="${cat._id}">Delete</button>
                    </div>
                `;
                categoriesListDiv.appendChild(catCard);
            });
            
            document.querySelectorAll('.edit-category-btn').forEach(button => {
                button.addEventListener('click', (e) => editCategory(e.target.dataset.id));
            });
            document.querySelectorAll('.delete-category-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteCategory(e.target.dataset.id));
            });

            categoryListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading categories:', error);
            categoryListMessage.textContent = 'Failed to load categories: ' + (error.message || 'Server error');
            categoryListMessage.className = 'error-message';
        }
    }

    async function editCategory(id) {
        const categoryToEdit = categories.find(cat => cat._id === id);
        if (categoryToEdit) {
            categoryNameInput.value = categoryToEdit.name;
            editingCategoryId = categoryToEdit._id;
            addCategoryForm.querySelector('button').textContent = 'Update Category';
        }
    }

    async function deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category? This will affect all linked menu items.')) {
            return;
        }
        try {
            await api.categories.deleteCategory(id);
            alert('Category deleted successfully');
            loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category: ' + (error.message || 'Server error'));
        }
    }

    // --- Menu Management Functions ---
    async function loadMenuItems() {
        try {
            allMenuItems = await window.api.menu.getMenu();
            displayCategoryFilters(categories);
            displayMenuItems(allMenuItems);
            menuListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading menu items:', error);
            menuListMessage.textContent = 'Failed to load menu items: ' + (error.message || 'Server error');
            menuListMessage.className = 'error-message';
        }
    }
    
    function displayCategoryFilters(categories) {
        menuCategoryFilterButtons.innerHTML = '';
        const allBtn = createFilterButton('All', 'all', true);
        allBtn.classList.add('active');
        allBtn.addEventListener('click', () => filterMenu('all'));
        menuCategoryFilterButtons.appendChild(allBtn);

        categories.forEach(cat => {
            const btn = createFilterButton(cat.name, cat._id);
            btn.addEventListener('click', () => filterMenu(cat._id));
            menuCategoryFilterButtons.appendChild(btn);
        });
    }

    function createFilterButton(name, id, isAll = false) {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.classList.add('category-btn');
        btn.dataset.categoryId = id;
        return btn;
    }

    function filterMenu(categoryId) {
        const buttons = document.querySelectorAll('#menu-category-filter-buttons .category-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category-id="${categoryId}"]`).classList.add('active');

        const filteredItems = categoryId === 'all'
            ? allMenuItems
            : allMenuItems.filter(item => item.categoryId && item.categoryId._id === categoryId);

        displayMenuItems(filteredItems);
    }
    
    function displayMenuItems(items) {
        menuItemsList.innerHTML = '';
        if (items.length === 0) {
            menuItemsList.innerHTML = '<p class="empty-state">No menu items added yet.</p>';
            return;
        }
        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('menu-card');
            itemCard.innerHTML = `
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="menu-card-image">` : ''}
                <div class="menu-card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description || ''}</p>
                    <p class="price">Price: $${item.price.toFixed(2)}</p>
                    <div class="menu-card-actions">
                        <button class="edit-btn secondary-btn" data-id="${item._id}">Edit</button>
                        <button class="delete-btn secondary-btn" data-id="${item._id}">Delete</button>
                    </div>
                </div>
            `;
            menuItemsList.appendChild(itemCard);
        });

        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => editMenuItem(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteMenuItem(e.target.dataset.id));
        });
        menuListMessage.textContent = '';
    }
    
    async function editMenuItem(id) {
        try {
            const menuItems = await window.api.menu.getMenu();
            const itemToEdit = menuItems.find(item => item._id === id);
            
            if (itemToEdit) {
                menuItemIdInput.value = itemToEdit._id;
                itemNameInput.value = itemToEdit.name;
                itemDescriptionInput.value = itemToEdit.description || '';
                itemPriceInput.value = itemToEdit.price;
                itemCategorySelect.value = itemToEdit.categoryId._id;
                menuItemSubmitBtn.textContent = 'Update Menu Item';
                if (itemToEdit.imageUrl) {
                    currentImagePreview.innerHTML = `<p>Current Image:</p><img src="${itemToEdit.imageUrl}" alt="Current Image" style="max-width: 150px; display: block; border-radius: 8px; margin-top: 10px;">`;
                } else {
                    currentImagePreview.innerHTML = '';
                }
                menuItemMessage.textContent = '';
            }
        } catch (error) {
            console.error('Error fetching menu item for edit:', error);
            menuItemMessage.textContent = 'Failed to load item for edit: ' + (error.message || 'Server error');
            menuItemMessage.className = 'error-message';
        }
    }

    async function deleteMenuItem(id) {
        if (!confirm('Are you sure you want to delete this menu item?')) {
            return;
        }
        try {
            await api.menu.deleteMenuItem(id);
            alert('Menu item deleted successfully');
            loadMenuItems();
        } catch (error) {
            console.error('Error deleting menu item:', error);
            alert('Failed to delete menu item: ' + (error.message || 'Server error'));
        }
    }
    
    // --- Table Management & QR Codes Functions ---
    async function loadTables() {
        try {
            const tables = await window.api.tables.getTables();
            tablesList.innerHTML = '';
            if (tables.length === 0) {
                tablesList.innerHTML = '<p class="empty-state">No tables added yet.</p>';
                return;
            }
            tables.forEach(table => {
                const tableCard = document.createElement('div');
                tableCard.classList.add('table-card');
                tableCard.innerHTML = `
                    <div class="table-card-header">
                        <h4 class="table-id-label">Table: ${table.tableId}</h4>
                    </div>
                    <div class="qr-code-container" id="qrCode-${table._id}"></div>
                    <div class="table-card-actions">
                        <button class="order-link-btn primary-btn" data-url="/order.html?storeId=${storeId}&table=${table.tableId}">Order Page</button>
                        <button class="delete-table-btn secondary-btn" data-id="${table._id}">Delete Table</button>
                    </div>
                `;
                tablesList.appendChild(tableCard);

                const orderPageUrl = `${window.location.protocol}//${window.location.host}/order.html?storeId=${storeId}&table=${table.tableId}`;
                generateQrCode(orderPageUrl, `qrCode-${table._id}`);
            });
            
            document.querySelectorAll('.delete-table-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteTable(e.target.dataset.id));
            });
            
            document.querySelectorAll('.order-link-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const url = e.target.dataset.url;
                    window.open(url, '_blank');
                });
            });

            tablesListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading tables:', error);
            tablesListMessage.textContent = 'Failed to load tables: ' + (error.message || 'Server error');
            tablesListMessage.className = 'error-message';
        }
    }

    async function deleteTable(id) {
        if (!confirm('Are you sure you want to delete this table? This will invalidate its QR code.')) {
            return;
        }
        try {
            await api.tables.deleteTable(id);
            alert('Table deleted successfully');
            loadTables();
        } catch (error) {
            console.error('Error deleting table:', error);
            alert('Failed to delete table: ' + (error.message || 'Server error'));
        }
    }

    // --- Live Orders Dashboard (Polling) ---
    async function loadOrders() {
        try {
            const orders = await api.orders.getStoreOrders();
            ordersDashboard.innerHTML = '';

            if (orders.length === 0) {
                ordersDashboard.innerHTML = '<p class="empty-state">No new orders.</p>';
                return;
            }

            orders.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.classList.add('order-card');
                
                const orderItemsHtml = order.items.map(item => `
                    <li>${item.quantity} x ${item.menuItemId.name} ($${item.menuItemId.price.toFixed(2)} each)</li>
                `).join('');

                orderDiv.innerHTML = `
                    <h3>Order for Table: ${order.tableId}</h3>
                    <p>Status: <span class="order-status-label">${order.status}</span></p>
                    <p>Order Time: ${new Date(order.createdAt).toLocaleString()}</p>
                    <h4>Items:</h4>
                    <ul>
                        ${orderItemsHtml}
                    </ul>
                    <select class="order-status-select" data-id="${order._id}">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                `;
                ordersDashboard.appendChild(orderDiv);
            });

            document.querySelectorAll('.order-status-select').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const orderId = e.target.dataset.id;
                    const newStatus = e.target.value;
                    try {
                        await api.orders.updateOrderStatus(orderId, newStatus);
                        alert('Order status updated!');
                        loadOrders();
                    } catch (error) {
                        console.error('Error updating order status:', error);
                        alert('Failed to update order status: ' + (error.message || 'Server error'));
                    }
                });
            });
            ordersMessage.textContent = '';
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersMessage.textContent = 'Failed to load orders: ' + (error.message || 'Server error');
            ordersMessage.className = 'error-message';
        }
    }

    // Start polling for orders (e.g., every 5 seconds)
    function startOrderPolling() {
        if (currentPollingInterval) {
            clearInterval(currentPollingInterval);
        }
        loadOrders();
        currentPollingInterval = setInterval(loadOrders, 5000);
    }

    // --- Initial data loads on page load ---
    loadCategories();
    loadMenuItems();
    loadTables();
    startOrderPolling();
});