import api from './api.js';

(function() {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOMContentLoaded fired. Starting customer.js execution.");

        const urlParams = new URLSearchParams(window.location.search);
        // MODIFIED: Get storeSlug instead of storeId from URL
        const storeSlug = urlParams.get('storeSlug');
        const tableId = urlParams.get('table');

        // MODIFIED: Declare storeId here, it will be resolved from slug
        let storeId = null;

        console.log(`URL Params - storeSlug: ${storeSlug}, tableId: ${tableId}`);

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
        const closeModalBtn = document.querySelector('.close-button'); // For order modal
        const orderSummaryContent = document.getElementById('orderSummaryContent');
        const emptyOrderMessage = document.getElementById('emptyOrderMessage');
        const storeLogoDisplay = document.getElementById('storeLogoDisplay');
        const menuSearchInput = document.getElementById('menuSearchInput');

        const confirmationModal = document.getElementById('confirmationModal');
        const continueShoppingBtn = document.getElementById('continueShoppingBtn');

        const bottomNavHomeBtn = document.getElementById('bottomNavHomeBtn');
        const bottomNavMenuBtn = document.getElementById('bottomNavMenuBtn');
        const bottomNavCartBtn = document.getElementById('bottomNavCartBtn');
        const bottomNavCartItemCount = document.getElementById('bottomNavCartItemCount');
        const bottomNavOrdersBtn = document.getElementById('bottomNavOrdersBtn');

        const customerOrdersList = document.getElementById('customerOrdersList');
        const customerOrdersMessage = document.getElementById('customerOrdersMessage');
        const menuSection = document.getElementById('menuSection');
        const ordersSection = document.getElementById('ordersSection');

        const categoryFilterWrapper = document.querySelector('.category-filter-wrapper');
        const scrollIndicatorRight = document.querySelector('.scroll-indicator.right');

        const productQuickViewModal = document.getElementById('productQuickViewModal');
        const closeQuickViewModalBtn = document.getElementById('closeQuickViewModal');
        const quickViewItemName = document.getElementById('quickViewItemName');
        const quickViewItemImage = document.getElementById('quickViewItemImage');
        const quickViewItemDescription = document.getElementById('quickViewItemDescription');
        const quickViewItemPrice = document.getElementById('quickViewItemPrice');
        const quickViewAddToCartBtn = document.getElementById('quickViewAddToCartBtn');


        let allMenuItems = [];
        let customerOrder = {};
        let customerPlacedOrders = [];


        // MODIFIED: Initial check for storeSlug and tableId
        if (!storeSlug || !tableId) {
            console.error("Missing storeSlug or tableId in URL.");
            if (menuErrorMessage) menuErrorMessage.textContent = 'Missing store slug or table ID in URL. Please scan a valid QR code.';
            if (submitOrderBtn) submitOrderBtn.disabled = true;
            if (floatingCartBtn) floatingCartBtn.style.display = 'none';
            if (bottomNavCartBtn) bottomNavCartBtn.style.display = 'none';
            if (bottomNavOrdersBtn) bottomNavOrdersBtn.style.display = 'none';
            return;
        }

        if (tableIdDisplay) tableIdDisplay.textContent = tableId;
        console.log("Store Slug and Table ID found. Initializing event listeners and data fetches.");

        // ADDED: Resolve storeSlug to storeId before proceeding
        try {
            const storeDetails = await api.stores.getStoreBySlug(storeSlug);
            storeId = storeDetails._id; // Set the global storeId
            console.log(`Resolved storeSlug '${storeSlug}' to storeId: ${storeId}`);

            // Update store name and logo immediately after resolving slug
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

        } catch (error) {
            console.error('Error resolving store slug:', error);
            if (menuErrorMessage) {
                menuErrorMessage.textContent = 'Failed to load store: ' + (error.message || 'Store not found or server error');
                menuErrorMessage.className = 'error-message';
            }
            // Disable further functionality if store cannot be resolved
            if (submitOrderBtn) submitOrderBtn.disabled = true;
            if (floatingCartBtn) floatingCartBtn.style.display = 'none';
            if (bottomNavCartBtn) bottomNavCartBtn.style.display = 'none';
            if (bottomNavOrdersBtn) bottomNavOrdersBtn.style.display = 'none';
            return; // Stop execution
        }


        // --- Modal Functionality (Order Modal) ---
        if (floatingCartBtn) {
            floatingCartBtn.addEventListener('click', () => {
                updateOrderSummary();
                if (orderModal) {
                    orderModal.style.display = 'flex';
                    document.body.classList.add('modal-open');
                }
            });
        }

        if (bottomNavCartBtn) {
            bottomNavCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                updateOrderSummary();
                if (orderModal) {
                    orderModal.style.display = 'flex';
                    document.body.classList.add('modal-open');
                }
            });
        }

        if (bottomNavOrdersBtn) {
            bottomNavOrdersBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await fetchAndDisplayCustomerOrders();
                if (ordersSection) {
                    ordersSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        if (bottomNavHomeBtn) {
            bottomNavHomeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        if (bottomNavMenuBtn) {
            bottomNavMenuBtn.addEventListener('click', (e) => {
                if (menuSection) {
                    menuSection.scrollIntoView({ behavior: 'smooth' });
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

        if (continueShoppingBtn) {
            continueShoppingBtn.addEventListener('click', () => {
                if (confirmationModal) confirmationModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
        
        window.addEventListener('click', (event) => {
            if (event.target == confirmationModal) {
                if (confirmationModal) confirmationModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });

        if (closeQuickViewModalBtn) {
            closeQuickViewModalBtn.addEventListener('click', () => {
                if (productQuickViewModal) productQuickViewModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target == productQuickViewModal) {
                if (productQuickViewModal) productQuickViewModal.style.display = 'none';
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

        window.addEventListener('load', checkScrollability);
        window.addEventListener('resize', checkScrollability);
        if (categoryFilterButtons) {
            categoryFilterButtons.addEventListener('scroll', checkScrollability);
        }
        setTimeout(checkScrollability, 500);


        // --- Fetch Menu Data ---
        async function fetchMenuData() {
            console.log("Attempting to fetch menu data...");
            try {
                // MODIFIED: Use the resolved storeId
                const response = await api.menu.getPublicMenu(storeId);
                allMenuItems = response;
                console.log("Menu data fetched successfully:", allMenuItems);
                
                allMenuItems.sort((a, b) => {
                    if (a.isBestSeller && !b.isBestSeller) {
                        return -1;
                    }
                    if (!a.isBestSeller && b.isBestSeller) {
                        return 1;
                    }
                    return 0;
                });

                // Store details are already set after resolving slug, no need to re-set from menu items
                // if (allMenuItems.length > 0) {
                //     const storeDetails = allMenuItems[0].storeId;
                //     if (storeDetails) {
                //         if (storeNameHeader) storeNameHeader.textContent = storeDetails.name;
                //         if (storeDetails.logoUrl && storeLogoDisplay) {
                //             storeLogoDisplay.src = storeDetails.logoUrl;
                //             storeLogoDisplay.classList.remove('hidden');
                //         } else if (storeLogoDisplay) {
                //             storeLogoDisplay.classList.add('hidden');
                //         }
                //     } else {
                //         if (storeNameHeader) storeNameHeader.textContent = 'Restaurant Menu';
                //         if (storeLogoDisplay) {
                //             storeLogoDisplay.classList.add('hidden');
                //         }
                //     }
                // } else {
                //     if (storeNameHeader) storeNameHeader.textContent = 'Restaurant Menu';
                //     if (storeLogoDisplay) {
                //         storeLogoDisplay.classList.add('hidden');
                //     }
                // }

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
                if (menuSearchInput) menuSearchInput.value = '';
            });
            if (categoryFilterButtons) categoryFilterButtons.appendChild(allBtn);

            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.textContent = cat.name;
                btn.classList.add('category-btn');
                btn.dataset.categoryId = cat.id;
                btn.addEventListener('click', () => {
                    filterMenu(cat.id);
                    if (menuSearchInput) menuSearchInput.value = '';
                });
                if (categoryFilterButtons) categoryFilterButtons.appendChild(btn);
            });
            checkScrollability();
        }

        function filterMenu(categoryId) {
            let filteredItems = [];
            if (categoryId === 'all') {
                filteredItems = allMenuItems;
            } else {
                filteredItems = allMenuItems.filter(item => item.categoryId && item.categoryId._id === categoryId);
            }

            displayMenuItems(filteredItems);

            document.querySelectorAll('.category-btn').forEach(btn => {
                if (btn.dataset.categoryId === categoryId) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
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
                
                itemCard.innerHTML = `
                    <div class="menu-card-image-wrapper" data-id="${item._id}">
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
                if (!button.disabled) {
                    button.addEventListener('click', (e) => addToOrder(e.currentTarget.dataset.id));
                }
            });

            document.querySelectorAll('.menu-card-image-wrapper').forEach(wrapper => {
                wrapper.addEventListener('click', (e) => {
                    const itemId = e.currentTarget.dataset.id;
                    const item = allMenuItems.find(i => i._id === itemId);
                    if (item) {
                        displayQuickViewModal(item);
                    }
                });
            });
        }

        if (menuSearchInput) {
            menuSearchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredItems = allMenuItems.filter(item =>
                    item.name.toLowerCase().includes(searchTerm) ||
                    (item.description && item.description.toLowerCase().includes(searchTerm))
                );
                displayMenuItems(filteredItems);
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            });
        }

        function addToOrder(menuItemId) {
            const item = allMenuItems.find(i => i._id === menuItemId);
            if (!item || !item.isAvailable) return;

            if (customerOrder[menuItemId]) {
                customerOrder[menuItemId].quantity++;
            } else {
                customerOrder[menuItemId] = { ...item, quantity: 1, remark: '' };
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

            if (floatingCartBtn) {
                floatingCartBtn.style.display = totalItems > 0 ? 'flex' : 'none';
            }
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
                        <div class="item-remark-container">
                            <span class="item-remark-display-toggle" data-id="${item._id}">
                                ${item.remark ? `Remark: ${item.remark}` : 'Add Remark'}
                            </span>
                            <textarea class="item-remark-input hidden" data-id="${item._id}" placeholder="e.g., no onions" rows="1">${item.remark || ''}</textarea>
                        </div>
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

            document.querySelectorAll('.item-remark-display-toggle').forEach(span => {
                span.addEventListener('click', (e) => {
                    const itemId = e.target.dataset.id;
                    const container = e.target.closest('.item-remark-container');
                    const displaySpan = container.querySelector('.item-remark-display-toggle');
                    const inputField = container.querySelector('.item-remark-input');

                    displaySpan.classList.add('hidden');
                    inputField.classList.remove('hidden');
                    inputField.focus();
                    inputField.select();
                });
            });

            document.querySelectorAll('.item-remark-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const itemId = e.target.dataset.id;
                    if (customerOrder[itemId]) {
                        customerOrder[itemId].remark = e.target.value;
                    }
                });

                input.addEventListener('blur', (e) => {
                    const itemId = e.target.dataset.id;
                    const container = e.target.closest('.item-remark-container');
                    const displaySpan = container.querySelector('.item-remark-display-toggle');
                    const inputField = container.querySelector('.item-remark-input');

                    displaySpan.textContent = customerOrder[itemId].remark ? `Remark: ${customerOrder[itemId].remark}` : 'Add Remark';
                    
                    inputField.classList.add('hidden');
                    displaySpan.classList.remove('hidden');
                });

                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        e.target.blur();
                    }
                });
            });
        }

        function displayQuickViewModal(item) {
            if (!productQuickViewModal) return;

            quickViewItemName.textContent = item.name;
            quickViewItemImage.src = item.imageUrl || 'https://placehold.co/400x400/cccccc/333333?text=No+Image';
            quickViewItemDescription.textContent = item.description || 'No description available.';
            quickViewItemPrice.textContent = `$${item.price.toFixed(2)}`;
            
            quickViewAddToCartBtn.dataset.id = item._id;
            quickViewAddToCartBtn.disabled = !item.isAvailable;
            quickViewAddToCartBtn.textContent = item.isAvailable ? 'Add to Cart' : 'Out of Stock';

            quickViewAddToCartBtn.removeEventListener('click', handleQuickViewAddToCart);
            quickViewAddToCartBtn.addEventListener('click', handleQuickViewAddToCart);

            productQuickViewModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }

        function handleQuickViewAddToCart(e) {
            const itemId = e.currentTarget.dataset.id;
            addToOrder(itemId);
            if (productQuickViewModal) productQuickViewModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }


        if (submitOrderBtn) {
            submitOrderBtn.addEventListener('click', async () => {
                const orderItems = Object.values(customerOrder).map(item => ({
                    menuItemId: item._id,
                    quantity: item.quantity,
                    remark: item.remark || ''
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
                    storeId: storeId, // Use the resolved storeId
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

                    customerOrder = {};
                    updateCartSummary();
                    updateOrderSummary();
                    await fetchAndDisplayCustomerOrders();

                } catch (error) {
                    console.error('Error placing order:', error);
                    const messageBox = document.createElement('div');
                    messageBox.classList.add('modal');
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

        async function fetchAndDisplayCustomerOrders() {
            try {
                // MODIFIED: Use the resolved storeId
                const response = await api.orders.getCustomerOrders(storeId, tableId);
                customerPlacedOrders = response;

                if (customerOrdersList) customerOrdersList.innerHTML = '';
                if (customerOrdersMessage) customerOrdersMessage.classList.remove('hidden');

                if (customerPlacedOrders.length === 0) {
                    if (customerOrdersMessage) customerOrdersMessage.textContent = 'No orders placed yet.';
                } else {
                    if (customerOrdersMessage) customerOrdersMessage.classList.add('hidden');
                    customerPlacedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    let grandTotalAllOrders = 0;

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
                                    ${item.remark ? `<p class="item-remark-display">Note: ${item.remark}</p>` : ''}
                                </li>
                            `;
                        }).join('');

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

                        grandTotalAllOrders += totalOrderPrice;
                    });

                    const grandTotalDiv = document.createElement('div');
                    grandTotalDiv.classList.add('grand-total-summary');
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
        // MODIFIED: fetchMenuData and fetchAndDisplayCustomerOrders now rely on storeId being resolved
        fetchMenuData();
        updateCartSummary();
        fetchAndDisplayCustomerOrders();
        setInterval(fetchAndDisplayCustomerOrders, 5000);
    });
})();