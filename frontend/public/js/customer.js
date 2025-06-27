(function() {
    const API_BASE_URL = 'http://localhost:5000/api'; // Use localhost for local dev

    document.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const storeId = urlParams.get('storeId');
        const tableId = urlParams.get('table');

        const storeNameHeader = document.getElementById('storeNameHeader');
        const tableIdDisplay = document.getElementById('tableIdDisplay');
        const menuList = document.getElementById('menuList');
        const menuErrorMessage = document.getElementById('menuErrorMessage');
        const orderItemsList = document.getElementById('orderItemsList');
        const orderTotalSpan = document.getElementById('orderTotal');
        const submitOrderBtn = document.getElementById('submitOrderBtn');
        const orderMessage = document.getElementById('orderMessage');
        const orderErrorMessage = document.getElementById('orderErrorMessage');
        const categoryFilterButtons = document.getElementById('category-filter-buttons');

        const viewCartBtn = document.getElementById('viewCartBtn');
        const cartItemCount = document.getElementById('cartItemCount');
        const cartTotalDisplay = document.getElementById('cartTotalDisplay');
        const orderModal = document.getElementById('orderModal');
        const closeModalBtn = document.querySelector('.close-button');
        const orderSummaryContent = document.getElementById('orderSummaryContent');
        const emptyOrderMessage = document.getElementById('emptyOrderMessage');
        const storeLogoDisplay = document.getElementById('storeLogoDisplay');

        let allMenuItems = [];
        let customerOrder = {}; // { menuItemId: { itemDetails, quantity } }

        if (!storeId || !tableId) {
            menuErrorMessage.textContent = 'Missing store ID or table ID in URL. Please scan a valid QR code.';
            submitOrderBtn.disabled = true;
            viewCartBtn.disabled = true;
            return;
        }

        tableIdDisplay.textContent = tableId;

        // --- Modal Functionality ---
        viewCartBtn.addEventListener('click', () => {
            updateOrderSummary(); // Ensure summary is fresh when modal opens
            orderModal.style.display = 'block';
            document.body.classList.add('modal-open'); // Add class to body to prevent scrolling
        });

        closeModalBtn.addEventListener('click', () => {
            orderModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });

        window.addEventListener('click', (event) => {
            if (event.target == orderModal) {
                orderModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        // --- Fetch Menu Data ---
        async function fetchMenuData() {
            try {
                // Use the PUBLIC menu endpoint and pass the storeId
                const response = await fetch(`${API_BASE_URL}/menu/public?storeId=${storeId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch menu items from the server.');
                }
                allMenuItems = await response.json();
                
                // Set store name and logo from the fetched data
                if (allMenuItems.length > 0) {
                    const storeDetails = allMenuItems[0].storeId;
                    if (storeDetails) {
                        storeNameHeader.textContent = storeDetails.name;
                        if (storeDetails.logoUrl) {
                            storeLogoDisplay.src = storeDetails.logoUrl;
                            storeLogoDisplay.classList.remove('hidden');
                        } else {
                            storeLogoDisplay.classList.add('hidden');
                        }
                    } else {
                        storeNameHeader.textContent = 'Restaurant Menu';
                        storeLogoDisplay.classList.add('hidden');
                    }
                } else {
                    storeNameHeader.textContent = 'Restaurant Menu';
                    storeLogoDisplay.classList.add('hidden');
                }

                // Group items by category to build the filter UI
                const categoriesMap = new Map();
                allMenuItems.forEach(item => {
                    if (item.categoryId && item.categoryId.name) {
                        const categoryName = item.categoryId.name;
                        const categoryId = item.categoryId._id;
                        if (!categoriesMap.has(categoryId)) {
                            categoriesMap.set(categoryId, { name: categoryName, id: categoryId });
                        }
                    }
                });
                const categories = Array.from(categoriesMap.values());
                
                displayCategoryFilters(categories);
                displayMenuItems(allMenuItems);
                menuErrorMessage.textContent = '';
                updateCartSummary();
            } catch (error) {
                console.error('Error loading menu data:', error);
                menuErrorMessage.textContent = 'Failed to load menu: ' + (error.message || 'Server error');
                menuErrorMessage.className = 'error-message';
            }
        }

        function displayCategoryFilters(categories) {
            categoryFilterButtons.innerHTML = '';

            const allBtn = document.createElement('button');
            allBtn.textContent = 'All';
            allBtn.classList.add('category-btn', 'active');
            allBtn.dataset.categoryId = 'all';
            allBtn.addEventListener('click', () => filterMenu('all'));
            categoryFilterButtons.appendChild(allBtn);

            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.textContent = cat.name;
                btn.classList.add('category-btn');
                btn.dataset.categoryId = cat.id;
                btn.addEventListener('click', () => filterMenu(cat.id));
                categoryFilterButtons.appendChild(btn);
            });
        }

        function filterMenu(categoryId) {
            const buttons = document.querySelectorAll('.category-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`[data-category-id="${categoryId}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
            }

            const filteredItems = categoryId === 'all'
                ? allMenuItems
                : allMenuItems.filter(item => item.categoryId && item.categoryId._id === categoryId);

            displayMenuItems(filteredItems);
        }
        
        function displayMenuItems(items) {
            menuList.innerHTML = '';
            if (items.length === 0) {
                menuList.innerHTML = '<p class="empty-state">No items available in this category.</p>';
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
                            <button class="add-to-order-btn primary-btn" data-id="${item._id}">Add to Cart</button>
                        </div>
                    </div>
                `;
                menuList.appendChild(itemCard);
            });

            document.querySelectorAll('.add-to-order-btn').forEach(button => {
                button.addEventListener('click', (e) => addToOrder(e.target.dataset.id));
            });
        }
        
        // --- Cart Management ---
        function addToOrder(menuItemId) {
            const item = allMenuItems.find(i => i._id === menuItemId);
            if (!item) return;

            if (customerOrder[menuItemId]) {
                customerOrder[menuItemId].quantity++;
            } else {
                customerOrder[menuItemId] = { ...item, quantity: 1 };
            }
            updateCartSummary();
        }

        function removeFromOrder(menuItemId) {
            if (customerOrder[menuItemId]) {
                customerOrder[menuItemId].quantity--;
                if (customerOrder[menuItemId].quantity <= 0) {
                    delete customerOrder[menuItemId];
                }
            }
            updateCartSummary();
        }

        function updateCartSummary() {
            let totalItems = 0;
            let totalPrice = 0;
            for (const itemId in customerOrder) {
                totalItems += customerOrder[itemId].quantity;
                totalPrice += customerOrder[itemId].quantity * customerOrder[itemId].price;
            }
            cartItemCount.textContent = totalItems;
            cartTotalDisplay.textContent = totalPrice.toFixed(2);

            viewCartBtn.style.display = totalItems > 0 ? 'flex' : 'flex';
        }

        function updateOrderSummary() {
            orderItemsList.innerHTML = '';
            let total = 0;
            let orderItemCount = 0;

            for (const itemId in customerOrder) {
                const item = customerOrder[itemId];
                const li = document.createElement('li');
                li.classList.add('order-summary-item');
                li.innerHTML = `
                    <div class="item-image-wrapper">
                        <img src="${item.imageUrl}" alt="${item.name}" class="item-thumbnail">
                    </div>
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-subtotal">$${(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                    <div class="item-price-controls">
                        <button class="remove-item-btn item-control-btn secondary-btn" data-id="${item._id}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="add-item-btn item-control-btn primary-btn" data-id="${item._id}">+</button>
                    </div>
                `;
                orderItemsList.appendChild(li);
                total += item.quantity * item.price;
                orderItemCount += item.quantity;
            }
            orderTotalSpan.textContent = total.toFixed(2);

            if (orderItemCount === 0) {
                orderSummaryContent.classList.add('hidden');
                emptyOrderMessage.classList.remove('hidden');
            } else {
                orderSummaryContent.classList.remove('hidden');
                emptyOrderMessage.classList.add('hidden');
            }

            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    removeFromOrder(e.target.dataset.id);
                    updateOrderSummary();
                });
            });
            document.querySelectorAll('.add-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    addToOrder(e.target.dataset.id);
                    updateOrderSummary();
                });
            });
        }

        submitOrderBtn.addEventListener('click', async () => {
            orderMessage.textContent = '';
            orderErrorMessage.textContent = '';

            const orderItems = Object.values(customerOrder).map(item => ({
                menuItemId: item._id,
                quantity: item.quantity
            }));

            if (orderItems.length === 0) {
                orderErrorMessage.textContent = 'Your cart is empty. Add some items before placing an order.';
                return;
            }

            const orderData = {
                storeId: storeId,
                tableId: tableId,
                items: orderItems
            };

            submitOrderBtn.disabled = true;
            try {
                await api.orders.placeOrder(orderData);
                orderMessage.textContent = 'Order placed successfully! Please wait for a staff member.';
                orderMessage.className = 'message success-message';
                customerOrder = {};
                updateCartSummary();
                updateOrderSummary();
                
                setTimeout(() => {
                    orderModal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    orderMessage.textContent = '';
                }, 3000); 

            } catch (error) {
                console.error('Error placing order:', error);
                orderErrorMessage.textContent = 'Failed to place order: ' + (error.message || 'Server error');
                orderErrorMessage.className = 'message error-message';
            } finally {
                submitOrderBtn.disabled = false;
            }
        });

        // Initial load
        fetchMenuData();
        updateCartSummary();
    });
})();