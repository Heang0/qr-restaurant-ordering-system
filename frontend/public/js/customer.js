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
        const categoryFilterButtons = document.getElementById('category-filter-buttons');

        const floatingCartBtn = document.getElementById('floatingCartBtn');
        const floatingCartItemCount = document.getElementById('floatingCartItemCount');
        const orderModal = document.getElementById('orderModal');
        const closeModalBtn = document.querySelector('.close-button');
        const orderSummaryContent = document.getElementById('orderSummaryContent');
        const emptyOrderMessage = document.getElementById('emptyOrderMessage');
        const storeLogoDisplay = document.getElementById('storeLogoDisplay');
        const menuSearchInput = document.getElementById('menuSearchInput');

        // --- Confirmation Modal Elements ---
        const confirmationModal = document.getElementById('confirmationModal');
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');

        // --- Bottom Navigation Elements ---
        const bottomNavHomeBtn = document.getElementById('bottomNavHomeBtn');
        const bottomNavMenuBtn = document.getElementById('bottomNavMenuBtn');
        const bottomNavCartBtn = document.getElementById('bottomNavCartBtn');
        const bottomNavCartItemCount = document.getElementById('bottomNavCartItemCount');
        const bottomNavOrdersBtn = document.getElementById('bottomNavOrdersBtn');

        // --- Order Tracking Elements ---
        const customerOrdersList = document.getElementById('customerOrdersList');
        const customerOrdersMessage = document.getElementById('customerOrdersMessage');
        const menuSection = document.getElementById('menuSection');
        const ordersSection = document.getElementById('ordersSection');

        // --- Scroll indicator elements ---
        const categoryFilterWrapper = document.querySelector('.category-filter-wrapper');
        const scrollIndicatorRight = document.querySelector('.scroll-indicator.right');


        let allMenuItems = [];
        let customerOrder = {}; // { menuItemId: { itemDetails, quantity } }
        let customerPlacedOrders = []; // To store customer's placed orders

        // API Helper (assuming it's available or defined here)
        const api = {
            fetch: async (endpoint, options = {}) => {
                const headers = {
                    'Content-Type': 'application/json',
                    ...options.headers
                };
                const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Something went wrong');
                }
                return response.json();
            },
            menu: {
                getPublicMenu: async (storeId) => api.fetch(`/menu/public?storeId=${storeId}`)
            },
            orders: {
                placeOrder: async (orderData) => api.fetch('/orders', {
                    method: 'POST',
                    body: JSON.stringify(orderData)
                }),
                getCustomerOrders: async (storeId, tableId) => api.fetch(`/orders/customer?storeId=${storeId}&tableId=${tableId}`)
            }
        };


        // Check if storeId and tableId are present in the URL
        if (!storeId || !tableId) {
            menuErrorMessage.textContent = 'Missing store ID or table ID in URL. Please scan a valid QR code.';
            if (submitOrderBtn) submitOrderBtn.disabled = true;
            if (floatingCartBtn) floatingCartBtn.style.display = 'none'; // Hide floating cart if invalid URL
            if (bottomNavCartBtn) bottomNavCartBtn.style.display = 'none'; // Hide bottom nav cart
            if (bottomNavOrdersBtn) bottomNavOrdersBtn.style.display = 'none'; // Hide bottom nav orders
            return;
        }

        if (tableIdDisplay) tableIdDisplay.textContent = tableId;

        // --- Modal Functionality ---
        if (floatingCartBtn) {
            floatingCartBtn.addEventListener('click', () => {
                updateOrderSummary(); // Ensure summary is fresh when modal opens
                if (orderModal) {
                    orderModal.style.display = 'flex'; // Use flex for centering
                    document.body.classList.add('modal-open'); // Add class to body to prevent scrolling
                }
            });
        }

        // Event listener for the bottom navigation cart button
        if (bottomNavCartBtn) {
            bottomNavCartBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior
                updateOrderSummary(); // Ensure summary is fresh when modal opens
                if (orderModal) {
                    orderModal.style.display = 'flex'; // Show the order modal
                    document.body.classList.add('modal-open'); // Prevent body scrolling
                }
            });
        }

        // Event listener for the bottom navigation Orders button
        if (bottomNavOrdersBtn) {
            bottomNavOrdersBtn.addEventListener('click', async (e) => {
                e.preventDefault(); // Prevent default link behavior
                // Fetch and display customer's orders
                await fetchAndDisplayCustomerOrders();
                // Scroll to the orders section
                if (ordersSection) {
                    ordersSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Event listener for the bottom navigation Home button
        if (bottomNavHomeBtn) {
            bottomNavHomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top of the page
            });
        }

        // Event listener for the bottom navigation Menu button
        if (bottomNavMenuBtn) {
            bottomNavMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth' }); // Scroll to menu section
                }
            });
        }


        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                if (orderModal) orderModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target == orderModal) {
                if (orderModal) orderModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        // Event listener for the Continue Shopping button on the confirmation modal
        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                if (confirmationModal) confirmationModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
        
        // Close confirmation modal if user clicks outside
        window.addEventListener('click', (event) => {
            if (event.target == confirmationModal) {
                if (confirmationModal) confirmationModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        // --- Scroll Indicator Logic ---
        function checkScrollability() {
            if (categoryFilterButtons && scrollIndicatorRight) {
                const isScrollable = categoryFilterButtons.scrollWidth > categoryFilterButtons.clientWidth;
                if (isScrollable) {
                    scrollIndicatorRight.style.opacity = '1';
                    scrollIndicatorRight.style.pointerEvents = 'auto';
                } else {
                    scrollIndicatorRight.style.opacity = '0';
                    scrollIndicatorRight.style.pointerEvents = 'none';
                }
            }
        }

        // Event listener for the right scroll indicator
        if (scrollIndicatorRight) {
            scrollIndicatorRight.addEventListener('click', () => {
                if (categoryFilterButtons) {
                    categoryFilterButtons.scrollBy({
                        left: 100, // Scroll 100px to the right
                        behavior: 'smooth'
                    });
                }
            });
        }

        // Check scrollability on load and resize
        window.addEventListener('load', checkScrollability);
        window.addEventListener('resize', checkScrollability);
        if (categoryFilterButtons) {
            categoryFilterButtons.addEventListener('scroll', checkScrollability); // Check on scroll too
        }
        setTimeout(checkScrollability, 500); // Small delay to ensure layout is rendered


        // --- Fetch Menu Data ---
        async function fetchMenuData() {
            try {
                // Use the PUBLIC menu endpoint and pass the storeId
                const response = await api.menu.getPublicMenu(storeId);
                allMenuItems = response;
                
                // Sort menu items to bring best sellers to the top
                allMenuItems.sort((a, b) => {
                    if (a.isBestSeller && !b.isBestSeller) {
                        return -1;
                    }
                    if (!a.isBestSeller && b.isBestSeller) {
                        return 1;
                    }
                    return 0;
                });

                // Set store name and logo from the fetched data
                if (allMenuItems.length > 0) {
                    const storeDetails = allMenuItems[0].storeId;
                    if (storeDetails) {
                        if (storeNameHeader) storeNameHeader.textContent = storeDetails.name;
                        if (storeDetails.logoUrl && storeLogoDisplay) {
                            storeLogoDisplay.src = storeDetails.logoUrl;
                            storeLogoDisplay.classList.remove('hidden');
                        } else if (storeLogoDisplay) {
                            storeLogoDisplay.classList.add('hidden');
                        }
                    } else {
                        if (storeNameHeader) storeNameHeader.textContent = 'Restaurant Menu';
                        if (storeLogoDisplay) {
                            storeLogoDisplay.classList.add('hidden');
                        }
                    }
                } else {
                    if (storeNameHeader) storeNameHeader.textContent = 'Restaurant Menu';
                    if (storeLogoDisplay) {
                        storeLogoDisplay.classList.add('hidden');
                    }
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
                displayMenuItems(allMenuItems); // Display all by default
                if (menuErrorMessage) menuErrorMessage.textContent = '';
                updateCartSummary();
            } catch (error) {
                console.error('Error loading menu data:', error);
                if (menuErrorMessage) {
                    menuErrorMessage.textContent = 'Failed to load menu: ' + (error.message || 'Server error');
                    menuErrorMessage.className = 'error-message';
                }
            }
        }

        function displayCategoryFilters(categories) {
            if (categoryFilterButtons) categoryFilterButtons.innerHTML = '';

            const allBtn = document.createElement('button');
            allBtn.textContent = 'All';
            allBtn.classList.add('category-btn', 'active');
            allBtn.dataset.categoryId = 'all';
            allBtn.addEventListener('click', () => {
                filterMenu('all');
                if (menuSearchInput) menuSearchInput.value = ''; // Clear search when filtering by category
            });
            if (categoryFilterButtons) categoryFilterButtons.appendChild(allBtn);

            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.textContent = cat.name;
                btn.classList.add('category-btn');
                btn.dataset.categoryId = cat.id;
                btn.addEventListener('click', () => {
                    filterMenu(cat.id);
                    if (menuSearchInput) menuSearchInput.value = ''; // Clear search when filtering by category
                });
                if (categoryFilterButtons) categoryFilterButtons.appendChild(btn);
            });
            checkScrollability(); // Re-check scrollability after rendering categories
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
            if (menuList) menuList.innerHTML = '';
            if (menuErrorMessage) {
                menuErrorMessage.className = 'message';
                menuErrorMessage.textContent = '';
            }

            if (items.length === 0) {
                if (menuList) menuList.innerHTML = '<p class="empty-state">No items available in this category.</p>';
                return;
            }

            items.forEach(item => {
                const itemCard = document.createElement('div');
                itemCard.classList.add('menu-card');
                
                // Construct the HTML for each menu card based on the new design
                itemCard.innerHTML = `
                    <div class="menu-card-image-wrapper">
                        ${item.isBestSeller ? '<div class="best-seller-tag">Best Seller</div>' : ''}
                        ${!item.isAvailable ? '<div class="out-of-stock-overlay"><div class="out-of-stock-tag">Out of Stock</div></div>' : ''}
                        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="menu-card-image">` : ''}
                    </div>
                    <div class="menu-card-content">
                        <h3>${item.name}</h3>
                        <p class="description">${item.description || ''}</p>
                        <div class="price-and-add-btn">
                            <span class="price">$${item.price.toFixed(2)}</span>
                            <button class="add-to-order-btn primary-btn" data-id="${item._id}" ${!item.isAvailable ? 'disabled' : ''}>
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                `;
                if (menuList) menuList.appendChild(itemCard);
            });

            document.querySelectorAll('.add-to-order-btn').forEach(button => {
                // Only add event listener if the button is not disabled (i.e., item is available)
                if (!button.disabled) {
                    button.addEventListener('click', (e) => addToOrder(e.currentTarget.dataset.id));
                }
            });
        }

        // --- Menu Search Logic ---
        if (menuSearchInput) {
            menuSearchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredItems = allMenuItems.filter(item =>
                    item.name.toLowerCase().includes(searchTerm) ||
                    (item.description && item.description.toLowerCase().includes(searchTerm))
                );
                displayMenuItems(filteredItems);
                // Deactivate all category filter buttons when searching
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            });
        }

        // --- Cart Management ---
        function addToOrder(menuItemId) {
            const item = allMenuItems.find(i => i._id === menuItemId);
            if (!item || !item.isAvailable) return; // Prevent adding out of stock items

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
            for (const itemId in customerOrder) {
                totalItems += customerOrder[itemId].quantity;
            }
            if (floatingCartItemCount) floatingCartItemCount.textContent = totalItems;
            if (bottomNavCartItemCount) {
                bottomNavCartItemCount.textContent = totalItems;
            }

            // Show/hide floating cart button based on total items
            if (floatingCartBtn) {
                floatingCartBtn.style.display = totalItems > 0 ? 'flex' : 'none';
            }
            // Add/remove 'active' class for bottom nav cart button if it exists
            if (bottomNavCartBtn) {
                if (totalItems > 0) {
                    bottomNavCartBtn.classList.add('active');
                } else {
                    bottomNavCartBtn.classList.remove('active');
                }
            }
        }

        function updateOrderSummary() {
            if (orderItemsList) orderItemsList.innerHTML = '';
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
                if (orderItemsList) orderItemsList.appendChild(li);
                total += item.quantity * item.price;
                orderItemCount += item.quantity;
            }
            if (orderTotalSpan) orderTotalSpan.textContent = total.toFixed(2);

            if (orderItemCount === 0) {
                if (orderSummaryContent) orderSummaryContent.classList.add('hidden');
                if (emptyOrderMessage) emptyOrderMessage.classList.remove('hidden');
            } else {
                if (orderSummaryContent) orderSummaryContent.classList.remove('hidden');
                if (emptyOrderMessage) emptyOrderMessage.classList.add('hidden');
            }

            document.querySelectorAll('.remove-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    removeFromOrder(e.currentTarget.dataset.id);
                    updateOrderSummary();
                });
            });
            document.querySelectorAll('.add-item-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    addToOrder(e.currentTarget.dataset.id);
                    updateOrderSummary();
                });
            });
        }

        if (submitOrderBtn) {
            submitOrderBtn.addEventListener('click', async () => {
                const orderItems = Object.values(customerOrder).map(item => ({
                    menuItemId: item._id,
                    quantity: item.quantity
                }));

                if (orderItems.length === 0) {
                    console.warn('Your cart is empty. Add some items before placing an order.');
                    if (emptyOrderMessage) {
                        emptyOrderMessage.textContent = 'Your cart is empty. Add some delicious items!';
                        emptyOrderMessage.classList.remove('hidden');
                        if (orderSummaryContent) orderSummaryContent.classList.add('hidden');
                    }
                    return;
                }

                const orderData = {
                    storeId: storeId,
                    tableId: tableId,
                    items: orderItems
                };

                if (submitOrderBtn) submitOrderBtn.disabled = true;
                try {
                    await api.orders.placeOrder(orderData);

                    if (orderModal) orderModal.style.display = 'none';
                    document.body.classList.remove('modal-open');

                    if (confirmationModal) confirmationModal.style.display = 'flex';
                    document.body.classList.add('modal-open');

                    customerOrder = {}; // Clear the cart
                    updateCartSummary();
                    updateOrderSummary();
                    await fetchAndDisplayCustomerOrders(); // Refresh customer's orders after placing a new one

                } catch (error) {
                    console.error('Error placing order:', error);
                    // Using a custom message box instead of alert()
                    const messageBox = document.createElement('div');
                    messageBox.classList.add('modal'); // Reuse modal styling
                    messageBox.innerHTML = `
                        <div class="modal-content confirmation-content">
                            <h2 class="section-title error-message">Order Failed</h2>
                            <p class="section-description">${error.message || 'Server error. Please try again.'}</p>
                            <button class="primary-btn close-message-box">OK</button>
                        </div>
                    `;
                    document.body.appendChild(messageBox);
                    messageBox.style.display = 'flex';
                    document.body.classList.add('modal-open');

                    messageBox.querySelector('.close-message-box').addEventListener('click', () => {
                        document.body.removeChild(messageBox);
                        document.body.classList.remove('modal-open');
                    });
                     // Close if clicking outside the message box
                    window.addEventListener('click', (event) => {
                        if (event.target === messageBox) {
                            document.body.removeChild(messageBox);
                            document.body.classList.remove('modal-open');
                        }
                    });

                } finally {
                    if (submitOrderBtn) submitOrderBtn.disabled = false;
                }
            });
        }

        // --- New: Fetch and Display Customer's Placed Orders ---
        async function fetchAndDisplayCustomerOrders() {
            try {
                const response = await api.orders.getCustomerOrders(storeId, tableId);
                customerPlacedOrders = response;

                if (customerOrdersList) customerOrdersList.innerHTML = ''; // Clear previous orders
                if (customerOrdersMessage) customerOrdersMessage.classList.remove('hidden'); // Ensure message is visible by default

                if (customerPlacedOrders.length === 0) {
                    if (customerOrdersMessage) customerOrdersMessage.textContent = 'No orders placed yet.';
                } else {
                    if (customerOrdersMessage) customerOrdersMessage.classList.add('hidden');
                    // Sort orders by creation date, newest first
                    customerPlacedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    let grandTotalAllOrders = 0; // Initialize grand total

                    customerPlacedOrders.forEach(order => {
                        const orderCard = document.createElement('div');
                        orderCard.classList.add('customer-order-card');
                        
                        let totalOrderPrice = 0;
                        const itemsHtml = order.items.map(item => {
                            const itemPrice = item.menuItemId.price * item.quantity;
                            totalOrderPrice += itemPrice;
                            return `
                                <li>
                                    ${item.menuItemId.imageUrl ? `<img src="${item.menuItemId.imageUrl}" alt="${item.menuItemId.name}" class="item-thumbnail">` : ''}
                                    <span>${item.menuItemId.name} x ${item.quantity}</span>
                                </li>
                            `;
                        }).join('');

                        // Add individual order details (without individual total)
                        orderCard.innerHTML = `
                            <h4>Order ID: ${order._id.substring(0, 8)}...</h4>
                            <div class="order-meta">
                                <span>Placed: ${new Date(order.createdAt).toLocaleString()}</span>
                                <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>
                            </div>
                            <ul class="order-items-list">
                                ${itemsHtml}
                            </ul>
                        `;
                        if (customerOrdersList) customerOrdersList.appendChild(orderCard);

                        grandTotalAllOrders += totalOrderPrice; // Add to grand total
                    });

                    // Append the grand total to the customerOrdersList
                    const grandTotalDiv = document.createElement('div');
                    grandTotalDiv.classList.add('grand-total-summary'); // Add a new class for styling
                    grandTotalDiv.innerHTML = `Grand Total: $${grandTotalAllOrders.toFixed(2)}`;
                    if (customerOrdersList) customerOrdersList.appendChild(grandTotalDiv);

                }
            }
             catch (error) {
                console.error('Error fetching customer orders:', error);
                if (customerOrdersMessage) {
                    customerOrdersMessage.textContent = 'Failed to load your orders: ' + (error.message || 'Server error');
                    customerOrdersMessage.classList.remove('hidden');
                }
            }
        }


        // Initial load
        fetchMenuData();
        updateCartSummary();
        fetchAndDisplayCustomerOrders(); // Load customer's orders on page load
        // Set up polling for customer orders to track status changes
        setInterval(fetchAndDisplayCustomerOrders, 10000); // Poll every 10 seconds
    });
})();
