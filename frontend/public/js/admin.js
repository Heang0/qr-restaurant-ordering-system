import api from './api.js';
import { checkAuthAndRedirect, logout } from './auth.js';
import { generateQrCode } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Attach logout button listener as early as possible within DOMContentLoaded
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const dashboardWrapper = document.querySelector('.dashboard-wrapper'); // Get the main wrapper

    // Check authentication and redirect if necessary
    // If checkAuthAndRedirect returns false, a redirect has happened or is pending.
    if (!checkAuthAndRedirect()) {
        console.log("Authentication check failed or redirected.");
        // The page will now be redirecting. No need to show content.
        return;
    }
    console.log("Authentication successful. Loading admin dashboard.");

    // If authentication is successful, remove the 'content-hidden' class
    // This will make the dashboard visible.
    if (dashboardWrapper) {
        dashboardWrapper.classList.remove('content-hidden');
    }

    const role = localStorage.getItem('role');
    const storeId = localStorage.getItem('storeId');

    // REMOVE THIS REDUNDANT REDIRECT. auth.js already handles this.
    // if (role !== 'superadmin' && role !== 'admin') {
    //     window.location.href = 'login.html'; // THIS LINE IS REDUNDANT AND SHOULD BE REMOVED/COMMENTED OUT
    //     return; // THIS LINE IS REDUNDANT AND SHOULD BE REMOVED/COMMENTED OUT
    // }

    // --- Sidebar Toggle Elements and Logic ---
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    const toggleSidebarBtnMobile = document.getElementById('toggleSidebarBtnMobile');

    function updateMainContentMargin() {
        if (!mainContent || !sidebar) return;

        if (window.innerWidth > 767) {
            if (sidebar.classList.contains('collapsed')) {
                mainContent.classList.add('sidebar-collapsed-margin');
            } else {
                mainContent.classList.remove('sidebar-collapsed-margin');
            }
        } else {
            mainContent.classList.remove('sidebar-collapsed-margin');
        }
    }

    if (toggleSidebarBtn) {
        toggleSidebarBtn.addEventListener('click', () => {
            if (sidebar) {
                sidebar.classList.toggle('collapsed');
                updateMainContentMargin();
            }
        });
    }

    if (toggleSidebarBtnMobile) {
        toggleSidebarBtnMobile.addEventListener('click', () => {
            if (dashboardWrapper) dashboardWrapper.classList.toggle('sidebar-open');
        });
    }

    if (dashboardWrapper) {
        dashboardWrapper.addEventListener('click', (event) => {
            if (window.innerWidth <= 767 && dashboardWrapper.classList.contains('sidebar-open') &&
                !sidebar.contains(event.target) &&
                event.target !== toggleSidebarBtnMobile &&
                !toggleSidebarBtnMobile.contains(event.target)) {
                dashboardWrapper.classList.remove('sidebar-open');
            }
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 767 && dashboardWrapper.classList.contains('sidebar-open')) {
            dashboardWrapper.classList.remove('sidebar-open');
        }
        if (window.innerWidth >= 768 && window.innerWidth <= 1023) {
            if (sidebar) sidebar.classList.add('collapsed');
        }
        updateMainContentMargin();
    });


    // --- Existing Elements (ensure they are correctly selected) ---
    const totalLiveOrdersEl = document.getElementById('totalLiveOrders');
    const pendingOrdersCountEl = document.getElementById('pendingOrdersCount');
    const readyOrdersCountEl = document.getElementById('readyOrdersCount');
    
    const storeInfoForm = document.getElementById('storeInfoForm');
    const storeNameInputBranding = document.getElementById('storeNameInput');
    const storeAddressInput = document.getElementById('storeAddressInput');
    const storePhoneInput = document.getElementById('storePhoneInput');
    const storeLogoInput = document.getElementById('storeLogo');
    const storeLogoMessage = document.getElementById('storeLogoMessage');
    const logoPreviewContainer = document.getElementById('currentStoreLogoPreview');
    const logoPreviewImg = document.getElementById('logoPreviewImg');
    const updateStoreInfoBtn = document.getElementById('updateStoreInfoBtn');

    const addTableForm = document.getElementById('addTableForm');
    const newTableIdInput = document.getElementById('newTableId');
    const addTableMessage = document.getElementById('addTableMessage');
    const tablesListDiv = document.getElementById('tablesList');
    const tablesListMessage = document.getElementById('tablesListMessage');
    
    const menuItemForm = document.getElementById('menuItemForm');
    const menuItemIdInput = document.getElementById('menuItemId');
    const itemNameInput = document.getElementById('itemName');
    const itemCategorySelect = document.getElementById('itemCategory');
    const itemDescriptionInput = document.getElementById('itemDescription');
    const itemPriceInput = document.getElementById('itemPrice');
    const itemImageInput = document.getElementById('itemImage');
    const menuItemSubmitBtn = document.getElementById('menuItemSubmitBtn');
    const menuItemMessage = document.getElementById('menuItemMessage');
    const currentImagePreview = document.getElementById('currentImagePreview');
    const menuCategoryFilterButtons = document.getElementById('menu-category-filter-buttons');
    const menuItemsList = document.getElementById('menuItemsList');
    const menuListMessage = document.getElementById('menuListMessage');
    const menuSearchInput = document.getElementById('menuSearchInput');
    const isBestSellerCheckbox = document.getElementById('isBestSellerCheckbox');
    const isAvailableCheckbox = document.getElementById('isAvailableCheckbox');


    const ordersDashboard = document.getElementById('ordersDashboard');
    const ordersMessage = document.getElementById('ordersMessage');

    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const closeOrderDetailsModalBtn = document.getElementById('closeOrderDetailsModal');
    const modalTableIdSpan = document.getElementById('modalTableId');
    const modalOrderListDiv = document.getElementById('modalOrderList');
    const modalOrdersMessage = document.getElementById('modalOrdersMessage');
    const clearTableHistoryBtn = document.getElementById('clearTableHistoryBtn');
    const modalTotalPrice = document.getElementById('modalTotalPrice');

    const printReceiptBtn = document.getElementById('printReceiptBtn');
    const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');

    const notificationSound = document.getElementById('notificationSound');
    const newOrderAlert = document.getElementById('newOrderAlert');

    let previousOrders = {};
    let allMenuItems = [];
    let currentStoreDetails = {};
    let currentOrdersForModal = [];

    let audioActivated = false;
    function activateAudio() {
        if (audioActivated) return;
        notificationSound.volume = 0;
        notificationSound.play().then(() => {
            notificationSound.pause();
            notificationSound.currentTime = 0;
            notificationSound.volume = 1;
            audioActivated = true;
            console.log("Audio playback enabled by user interaction.");
        }).catch(error => {
            console.error("Failed to activate audio (user not interacted enough):", error);
        });
        document.removeEventListener('click', activateAudio);
        document.removeEventListener('touchstart', activateAudio);
    }
    document.addEventListener('click', activateAudio);
    document.addEventListener('touchstart', activateAudio);


    // --- Conditional UI for Superadmin vs Admin ---
    if (role === 'superadmin') {
        if (document.getElementById('tab-stores')) document.getElementById('tab-stores').style.display = 'none';
        if (document.getElementById('tab-users')) document.getElementById('tab-users').style.display = 'none';
    } else if (role === 'admin') {
        const adminTabs = ['overview', 'categories', 'menu', 'branding', 'tables', 'orders'];
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
            if (!adminTabs.includes(btn.dataset.tab)) {
                btn.style.display = 'none';
            }
        });
    }


    // --- Tab Navigation Logic (Adjusted for Sidebar) ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            const targetContent = document.getElementById(`tab-${tabId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            if (window.innerWidth <= 767 && dashboardWrapper && dashboardWrapper.classList.contains('sidebar-open')) {
                dashboardWrapper.classList.remove('sidebar-open');
            }
        });
    });

    function setLoading(button, isLoading) {
        if (isLoading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin loading-spinner"></i>';
            button.disabled = true;
            button.style.cursor = 'wait';
        } else {
            button.disabled = false;
            button.style.cursor = 'pointer';
        }
    }


    async function loadStoreDetails() {
        if (!storeId) return;
        try {
            currentStoreDetails = await api.stores.getStoreById(storeId);
            console.log('Fetched store details:', currentStoreDetails);

            if (storeNameInputBranding) storeNameInputBranding.value = currentStoreDetails.name || '';
            if (storeAddressInput) storeAddressInput.value = currentStoreDetails.address || '';
            if (storePhoneInput) storePhoneInput.value = currentStoreDetails.phone || '';
            
            if (currentStoreDetails.logoUrl) {
                logoPreviewImg.src = currentStoreDetails.logoUrl;
                logoPreviewImg.classList.remove('hidden');
                logoPreviewContainer.style.border = 'none';
            } else {
                logoPreviewImg.src = '';
                logoPreviewImg.classList.add('hidden');
                logoPreviewContainer.style.border = '2px dashed #bdc3c7';
            }
        } catch (error) {
            console.error('Error fetching store details:', error);
            if (storeLogoMessage) {
                storeLogoMessage.textContent = 'Failed to load store info preview.';
                storeLogoMessage.className = 'error-message';
            }
        }
    }

    async function loadCategories() {
        if (!storeId) {
            console.error('Store ID not found. Cannot load categories.');
            return;
        }
        try {
            const categories = await api.categories.getCategories(storeId);
            const categoriesListDiv = document.getElementById('categoriesList');
            if(categoriesListDiv) categoriesListDiv.innerHTML = '';

            if (categories.length === 0) {
                if(categoriesListDiv) categoriesListDiv.innerHTML = '<p class="empty-state">No categories added yet.</p>';
                return;
            }

            categories.forEach(category => {
                const categoryCard = document.createElement('div');
                categoryCard.classList.add('table-card');
                categoryCard.innerHTML = `
                    <p class="table-id-label">${category.name}</p>
                    <div class="table-card-actions">
                        <button class="edit-category-btn secondary-btn" data-id="${category._id}" data-name="${category.name}">Edit</button>
                        <button class="delete-category-btn secondary-btn" data-id="${category._id}">Delete</button>
                    </div>
                `;
                if(categoriesListDiv) categoriesListDiv.appendChild(categoryCard);
            });

            if(categoriesListDiv) {
                categoriesListDiv.querySelectorAll('.edit-category-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const id = e.target.dataset.id;
                        const name = e.target.dataset.name;
                        document.getElementById('categoryName').value = name;
                        document.getElementById('addCategoryForm').dataset.editingId = id;
                        document.querySelector('#addCategoryForm button[type="submit"]').textContent = 'Update Category';
                    });
                });
                categoriesListDiv.querySelectorAll('.delete-category-btn').forEach(button => {
                    button.addEventListener('click', (e) => deleteCategory(e.target.dataset.id));
                });
            }

            itemCategorySelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select Category';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            itemCategorySelect.appendChild(defaultOption);

            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat._id;
                option.textContent = cat.name;
                itemCategorySelect.appendChild(option);
            });
            if(menuCategoryFilterButtons){
                menuCategoryFilterButtons.innerHTML = '';
                const allBtn = document.createElement('button');
                allBtn.textContent = 'All';
                allBtn.classList.add('category-btn', 'active');
                allBtn.dataset.categoryId = 'all';
                allBtn.addEventListener('click', () => {
                    filterMenu('all');
                    menuSearchInput.value = '';
                });
                menuCategoryFilterButtons.appendChild(allBtn);
                categories.forEach(cat => {
                    const btn = document.createElement('button');
                    btn.textContent = cat.name;
                    btn.classList.add('category-btn');
                    btn.dataset.categoryId = cat._id;
                    btn.addEventListener('click', () => {
                        filterMenu(cat._id);
                        menuSearchInput.value = '';
                    });
                    menuCategoryFilterButtons.appendChild(btn);
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async function loadMenuItems() {
        if (!storeId) return;
        try {
            const menuItems = await api.menu.getMenu(storeId);
            allMenuItems = menuItems;
            console.log('Fetched allMenuItems:', allMenuItems);
            displayMenuItems(allMenuItems);
            menuListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading menu items:', error);
            menuListMessage.textContent = 'Failed to load menu items.';
            menuListMessage.className = 'error-message';
        }
    }
    
    function displayMenuItems(items) {
        menuItemsList.innerHTML = '';
        if (items.length === 0) {
            menuItemsList.innerHTML = '<p class="empty-state">No menu items found.</p>';
            return;
        }

        items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.classList.add('menu-card');
            if (!item.isAvailable) {
                itemCard.classList.add('out-of-stock-card');
            }
            itemCard.innerHTML = `
                ${item.isBestSeller ? '<div class="best-seller-tag">Best Seller</div>' : ''}
                ${!item.isAvailable ? '<div class="out-of-stock-overlay"><div class="out-of-stock-tag">Out of Stock</div></div>' : ''}
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="menu-card-image">` : ''}
                <div class="menu-card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description || ''}</p>
                    <p class="price">Price: $${item.price.toFixed(2)}</p>
                </div>
                <div class="menu-card-actions">
                    <button class="edit-btn secondary-btn" data-id="${item._id}">Edit</button>
                    <button class="delete-btn delete-btn" data-id="${item._id}">Delete</button>
                </div>
            `;
            menuItemsList.appendChild(itemCard);
        });
        
        menuItemsList.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', (e) => editMenuItem(e.target.dataset.id));
        });
        menuItemsList.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteMenuItem(e.target.dataset.id));
        });
    }

    function filterMenu(categoryId) {
        const buttons = document.querySelectorAll('#menu-category-filter-buttons .category-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        if (categoryId === 'all') {
            displayMenuItems(allMenuItems);
            return;
        }

        const filteredItems = allMenuItems.filter(item => item.categoryId && item.categoryId._id === categoryId);
        displayMenuItems(filteredItems);
    }

    if (menuSearchInput) {
        menuSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredItems = allMenuItems.filter(item =>
                item.name.toLowerCase().includes(searchTerm) ||
                (item.description && item.description.toLowerCase().includes(searchTerm))
            );
            displayMenuItems(filteredItems);
            // Remove active class from category filter buttons when searching
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        });
    }

    function resetMenuItemForm() {
        menuItemForm.reset();
        menuItemIdInput.value = '';
        menuItemSubmitBtn.textContent = 'Add Menu Item';
        menuItemMessage.textContent = '';
        menuItemMessage.className = 'message';
        currentImagePreview.innerHTML = '';
        currentImagePreview.style.border = '2px dashed #bdc3c7';
        isBestSellerCheckbox.checked = false;
        isAvailableCheckbox.checked = false;
    }

    if (itemImageInput) {
        itemImageInput.addEventListener('change', () => {
            const file = itemImageInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    currentImagePreview.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = "Selected Image";
                    img.classList.add('menu-item-preview-img');
                    currentImagePreview.appendChild(img);
                    currentImagePreview.style.border = 'none';
                };
                reader.readAsDataURL(file);
            } else {
                currentImagePreview.innerHTML = '';
                currentImagePreview.style.border = '2px dashed #bdc3c7';
            }
        });
    }

    async function handleMenuItemSubmit(e) {
        e.preventDefault();
        const itemId = menuItemIdInput.value;
        const isEditing = !!itemId;
        const formData = new FormData();
        formData.append('name', itemNameInput.value.trim());
        formData.append('description', itemDescriptionInput.value.trim());
        formData.append('price', parseFloat(itemPriceInput.value));
        formData.append('categoryId', itemCategorySelect.value);
        formData.append('isBestSeller', isBestSellerCheckbox.checked);
        formData.append('isAvailable', isAvailableCheckbox.checked);

        if (itemImageInput.files[0]) {
            formData.append('image', itemImageInput.files[0]);
        }

        const originalBtnText = menuItemSubmitBtn.textContent;
        setLoading(menuItemSubmitBtn, true);

        try {
            let response;
            if (isEditing) {
                response = await api.menu.updateMenuItem(itemId, formData);
                menuItemMessage.textContent = 'Menu item updated successfully!';
            } else {
                response = await api.menu.addMenuItem(formData);
                menuItemMessage.textContent = 'Menu item added successfully!';
            }
            menuItemMessage.className = 'success-message';
            
            resetMenuItemForm();
            await loadMenuItems();
        } catch (error) {
            console.error('Error saving menu item:', error);
            menuItemMessage.textContent = 'Failed to save menu item: ' + (error.message || 'Server error');
            menuItemMessage.className = 'error-message';
        } finally {
            setLoading(menuItemSubmitBtn, false);
            menuItemSubmitBtn.textContent = originalBtnText;
        }
    }
    menuItemForm.addEventListener('submit', handleMenuItemSubmit);

    async function editMenuItem(id) {
        try {
            const item = allMenuItems.find(i => i._id === id);
            if (!item) {
                console.error('Item not found for editing:', id);
                return;
            }
            console.log('Editing item object:', item);
            console.log('Image URL for editing:', item.imageUrl);

            const menuTabButton = document.querySelector('.tab-btn[data-tab="menu"]');
            if (menuTabButton) {
                menuTabButton.click(); 
            }

            menuItemIdInput.value = item._id;
            itemNameInput.value = item.name;
            itemDescriptionInput.value = item.description;
            itemPriceInput.value = item.price;
            if (item.categoryId && item.categoryId._id) {
                itemCategorySelect.value = item.categoryId._id;
            } else {
                itemCategorySelect.value = '';
            }
            isBestSellerCheckbox.checked = item.isBestSeller;
            isAvailableCheckbox.checked = item.isAvailable;

            currentImagePreview.innerHTML = '';
            if (item.imageUrl) {
                const img = document.createElement('img');
                img.src = item.imageUrl;
                img.alt = item.name;
                img.classList.add('menu-item-preview-img');
                currentImagePreview.appendChild(img);
                currentImagePreview.style.border = 'none';
            } else {
                currentImagePreview.style.border = '2px dashed #bdc3c7';
            }

            menuItemSubmitBtn.textContent = 'Update Menu Item';
            menuItemMessage.textContent = 'Editing: ' + item.name;
            menuItemMessage.className = 'message';
            
            setTimeout(() => {
                if (menuItemForm.offsetParent !== null) {
                    menuItemForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    console.warn("menuItemForm is not visible, cannot scroll.");
                }
            }, 300);
            
        } catch (error) {
            console.error('Error fetching menu item for edit:', error);
        }
    }

    async function deleteMenuItem(id) {
        const confirmDelete = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content product-quick-view-content">
                    <div class="modal-header">
                        <h2 class="section-title">Confirm Deletion</h2>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body quick-view-body">
                        <p>Are you sure you want to delete this menu item?</p>
                        <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
                            <button class="primary-btn" id="confirmDeleteBtn">Delete</button>
                            <button class="secondary-btn" id="cancelDeleteBtn">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'flex';

            const closeBtn = modal.querySelector('.close-button');
            const confirmBtn = modal.querySelector('#confirmDeleteBtn');
            const cancelBtn = modal.querySelector('#cancelDeleteBtn');

            const closeModal = () => {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            };

            closeBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            confirmBtn.addEventListener('click', () => { closeModal(); resolve(true); });

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                    resolve(false);
                }
            });
        });

        if (!confirmDelete) {
            return;
        }

        try {
            await api.menu.deleteMenuItem(id);
            const successModal = document.createElement('div');
            successModal.classList.add('modal');
            successModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-check-circle confirmation-icon"></i>
                    <h2 class="section-title">Success!</h2>
                    <p>Menu item deleted successfully!</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(successModal);
            successModal.style.display = 'flex';

            const okBtn = successModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                successModal.style.display = 'none';
                document.body.removeChild(successModal);
            });

            await loadMenuItems();
        } catch (error) {
            console.error('Error deleting menu item:', error);
            const errorModal = document.createElement('div');
            errorModal.classList.add('modal');
            errorModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-times-circle confirmation-icon" style="color: #e74c3c;"></i>
                    <h2 class="section-title">Error!</h2>
                    <p>Failed to delete menu item: ${error.message || 'Server error'}</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(errorModal);
            errorModal.style.display = 'flex';

            const okBtn = errorModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                errorModal.style.display = 'none';
                document.body.removeChild(errorModal);
            });
        }
    }

    const addCategoryForm = document.getElementById('addCategoryForm');
    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryName = document.getElementById('categoryName').value.trim();
        const editingId = addCategoryForm.dataset.editingId;

        if (!categoryName) return;

        const submitBtn = document.querySelector('#addCategoryForm button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        setLoading(submitBtn, true);

        try {
            let response;
            if (editingId) {
                response = await api.categories.updateCategory(editingId, { name: categoryName });
                document.getElementById('addCategoryMessage').textContent = 'Category updated successfully!';
            } else {
                response = await api.categories.addCategory({ name: categoryName });
                document.getElementById('addCategoryMessage').textContent = 'Category created successfully!';
            }
            document.getElementById('addCategoryMessage').className = 'success-message';
            document.getElementById('categoryName').value = '';
            delete addCategoryForm.dataset.editingId;
            submitBtn.textContent = 'Add Category';
            await loadCategories();
            await loadMenuItems();
        } catch (error) {
            console.error('Error saving category:', error);
            document.getElementById('addCategoryMessage').textContent = 'Failed to save category: ' + (error.message || 'Server error');
            document.getElementById('addCategoryMessage').className = 'error-message';
        } finally {
            setLoading(submitBtn, false);
            submitBtn.textContent = originalBtnText;
        }
    });

    async function deleteCategory(id) {
        const confirmDelete = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content product-quick-view-content">
                    <div class="modal-header">
                        <h2 class="section-title">Confirm Deletion</h2>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body quick-view-body">
                        <p>Are you sure you want to delete this category?</p>
                        <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
                            <button class="primary-btn" id="confirmDeleteBtn">Delete</button>
                            <button class="secondary-btn" id="cancelDeleteBtn">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'flex';

            const closeBtn = modal.querySelector('.close-button');
            const confirmBtn = modal.querySelector('#confirmDeleteBtn');
            const cancelBtn = modal.querySelector('#cancelDeleteBtn');

            const closeModal = () => {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            };

            closeBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            confirmBtn.addEventListener('click', () => { closeModal(); resolve(true); });

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                    resolve(false);
                }
            });
        });

        if (!confirmDelete) {
            return;
        }
        try {
            await api.categories.deleteCategory(id);
            const successModal = document.createElement('div');
            successModal.classList.add('modal');
            successModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-check-circle confirmation-icon"></i>
                    <h2 class="section-title">Success!</h2>
                    <p>Category deleted successfully!</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(successModal);
            successModal.style.display = 'flex';

            const okBtn = successModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                successModal.style.display = 'none';
                document.body.removeChild(successModal);
            });
            await loadCategories();
            await loadMenuItems();
        } catch (error) {
            console.error('Error deleting category:', error);
            const errorModal = document.createElement('div');
            errorModal.classList.add('modal');
            errorModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-times-circle confirmation-icon" style="color: #e74c3c;"></i>
                    <h2 class="section-title">Error!</h2>
                    <p>Failed to delete category: ${error.message || 'Server error'}</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(errorModal);
            errorModal.style.display = 'flex';

            const okBtn = errorModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                errorModal.style.display = 'none';
                document.body.removeChild(errorModal);
            });
        }
    }

    async function loadStores() {
        console.log("loadStores called in admin.js - this function is typically for superadmin.");
    }

    async function loadAdmins() {
        console.log("loadAdmins called in admin.js - this function is typically for superadmin.");
    }
    
    async function loadStoreLogo() {
        if (!storeId) {
            console.warn('Store ID not found in local storage for logo. Skipping logo load for admin page.');
            if (logoPreviewContainer) {
                logoPreviewContainer.style.border = '2px dashed #bdc3c7';
            }
            if (logoPreviewImg) {
                 logoPreviewImg.classList.add('hidden');
            }
            return;
        }
        try {
            const store = await api.stores.getStoreById(storeId);
            if (store && store.logoUrl) {
                logoPreviewImg.src = store.logoUrl;
                logoPreviewImg.classList.remove('hidden');
                logoPreviewContainer.style.border = 'none';
            } else {
                logoPreviewImg.src = '';
                logoPreviewImg.classList.add('hidden');
                logoPreviewContainer.style.border = '2px dashed #bdc3c7';
            }
        } catch (error) {
            console.error('Error fetching store logo:', error);
            if (storeLogoMessage) {
                storeLogoMessage.textContent = 'Failed to load store logo preview.';
                storeLogoMessage.className = 'error-message';
            }
            if (logoPreviewContainer) logoPreviewContainer.style.border = '2px dashed #bdc3c7';
            if (logoPreviewImg) logoPreviewImg.classList.add('hidden');
        }
    }

    async function loadTables() {
        if (!storeId) {
            if(tablesListMessage) {
                tablesListMessage.textContent = 'Store ID not found. Cannot load tables.';
                tablesListMessage.className = 'error-error-message';
            }
            return;
        }
        try {
            const tables = await api.tables.getTables(storeId);
            const tablesListDiv = document.getElementById('tablesList');
            if(tablesListDiv) tablesListDiv.innerHTML = '';
            if (tables.length === 0) {
                if(tablesListDiv) tablesListDiv.innerHTML = '<p class="empty-state">No tables added yet.</p>';
                return;
            }

            await loadStoreDetails();

            tables.forEach(table => {
                const tableCard = document.createElement('div');
                tableCard.classList.add('table-card'); 
                const qrCodeId = `qr-${table._id}`;
                const storeSlug = currentStoreDetails && currentStoreDetails.slug ? currentStoreDetails.slug : 'default-store';
                const orderPageUrl = `${window.location.origin}/order.html?storeSlug=${storeSlug}&table=${table.tableId}`;
                tableCard.innerHTML = `
                    <p class="table-id-label">Table: ${table.tableId}</p>
                    <div id="${qrCodeId}" class="qr-code-container"></div>
                    <div class="table-card-actions">
                        <button class="order-link-btn primary-btn" data-table-id="${table.tableId}">View Order Link</button>
                        <button class="delete-table-btn secondary-btn" data-id="${table._id}">Delete Table</button>
                        <button class="clear-table-btn secondary-btn" data-table-id="${table.tableId}">Clear Table Orders</button>
                    </div>
                `;
                if(tablesListDiv) tablesListDiv.appendChild(tableCard);
                generateQrCode(orderPageUrl, qrCodeId);
            });

            tablesListDiv.querySelectorAll('.order-link-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const tableId = e.target.dataset.tableId;
                    const storeSlug = currentStoreDetails && currentStoreDetails.slug ? currentStoreDetails.slug : 'default-store';
                    const orderPageUrl = `${window.location.origin}/order.html?storeSlug=${storeSlug}&table=${tableId}`;
                    window.open(orderPageUrl, '_blank');
                });
            });

            tablesListDiv.querySelectorAll('.delete-table-btn').forEach(button => {
                button.addEventListener('click', (e) => deleteTable(e.target.dataset.id));
            });

            tablesListDiv.querySelectorAll('.clear-table-btn').forEach(button => {
                button.addEventListener('click', (e) => clearTableOrders(e.target.dataset.tableId));
            });

            if (tablesListMessage) tablesListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading tables:', error);
            if (tablesListMessage) {
                tablesListMessage.textContent = 'Failed to load tables: ' + (error.message || 'Server error');
                tablesListMessage.className = 'error-error-message';
            }
        }
    }

    async function fetchAndDisplayOrders() {
        if (!storeId) {
            if(ordersMessage) {
                ordersMessage.textContent = 'Store ID not found. Cannot load orders.';
                ordersMessage.className = 'error-error-message';
            }
            return;
        }

        try {
            const currentOrders = await api.orders.getStoreOrders();
            
            const ordersByTable = currentOrders.reduce((acc, order) => {
                if (!acc[order.tableId]) {
                    acc[order.tableId] = [];
                }
                acc[order.tableId].push(order);
                return acc;
            }, {});

            const previousOrderCount = Object.values(previousOrders).flat().length;
            const currentOrderCount = Object.values(ordersByTable).flat().length;
            
            if (currentOrderCount > previousOrderCount) {
                if (notificationSound) {
                    notificationSound.play().catch(error => {
                        console.error("Audio playback failed:", error);
                    });
                }
                if (newOrderAlert) {
                    newOrderAlert.classList.add('show');
                    setTimeout(() => {
                        newOrderAlert.classList.remove('show');
                    }, 3000);
                }
            }
            
            const pendingOrders = currentOrders.filter(o => o.status === 'Pending').length;
            const readyOrders = currentOrders.filter(o => o.status === 'Ready').length;
            if (totalLiveOrdersEl) totalLiveOrdersEl.textContent = currentOrders.length;
            if (pendingOrdersCountEl) pendingOrdersCountEl.textContent = pendingOrders;
            if (readyOrdersCountEl) readyOrdersCountEl.textContent = readyOrders;

            if (ordersDashboard) ordersDashboard.innerHTML = '';

            if (Object.keys(ordersByTable).length === 0) {
                if (ordersDashboard) ordersDashboard.innerHTML = '<p class="empty-state">No live orders at the moment.</p>';
                return;
            }

            const newOrderTables = new Set();
            for (const tableId in ordersByTable) {
                const tableOrders = ordersByTable[tableId];
                const prevTableOrders = previousOrders[tableId] || [];

                if (tableOrders.length > prevTableOrders.length) {
                    newOrderTables.add(tableId);
                } else {
                    for (const order of tableOrders) {
                        const prevOrder = prevTableOrders.find(po => po._id === order._id);
                        if (!prevOrder || prevOrder.status !== order.status) {
                            newOrderTables.add(tableId);
                            break;
                        }
                    }
                }

                const tableOrderCard = document.createElement('div');
                tableOrderCard.classList.add('order-table-card');
                if (newOrderTables.has(tableId)) {
                    tableOrderCard.classList.add('new-order-highlight');
                    setTimeout(() => {
                        tableOrderCard.classList.remove('new-order-highlight');
                    }, 3000);
                }
                
                const pendingItemsCount = tableOrders.filter(o => o.status === 'Pending').length;
                const latestStatus = tableOrders[0] ? tableOrders[0].status : 'N/A';
                tableOrderCard.innerHTML = `
                    <div class="table-info-header">
                        <h3>Table: ${tableId}</h3>
                        <span class="status-badge ${latestStatus.toLowerCase()}">${latestStatus}</span>
                    </div>
                    <p>Total Orders: ${tableOrders.length}</p>
                    <p>Pending Items: ${pendingItemsCount}</p>
                    <button class="view-table-orders-btn primary-btn" data-table-id="${tableId}" data-store-slug="${currentStoreDetails.slug}">View Details</button>
                `;
                if(ordersDashboard) ordersDashboard.appendChild(tableOrderCard);
            }
            previousOrders = ordersByTable;

            if(ordersDashboard) {
                ordersDashboard.querySelectorAll('.view-table-orders-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const tableId = e.target.dataset.tableId;
                        const latestOrdersForTable = await api.orders.getStoreOrders()
                            .then(orders => orders.filter(o => o.tableId === tableId));
                        displayOrderDetailsModal(tableId, latestOrdersForTable);
                    });
                });
            }

            if(ordersMessage) ordersMessage.textContent = '';
        } catch (error) {
            console.error('Error loading live orders:', error);
            if(ordersMessage) {
                ordersMessage.textContent = 'Failed to load live orders: ' + (error.message || 'Server error');
                ordersMessage.className = 'error-error-message';
            }
        }
    }

    function displayOrderDetailsModal(tableId, orders) {
        currentOrdersForModal = orders;
        
        if(modalTableIdSpan) modalTableIdSpan.textContent = tableId;
        if(modalOrderListDiv) modalOrderListDiv.innerHTML = '';
        if(modalOrdersMessage) modalOrdersMessage.textContent = '';

        let totalAllOrdersPrice = 0;
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                order.items.forEach(item => {
                    totalAllOrdersPrice += item.menuItemId.price * item.quantity;
                });
            });
        }
        if (modalTotalPrice) {
            modalTotalPrice.textContent = `Total for Table ${tableId}: $${totalAllOrdersPrice.toFixed(2)}`;
        }


        if (!orders || orders.length === 0) {
            if(modalOrdersMessage) {
                modalOrdersMessage.textContent = 'No orders for this table.';
                modalOrdersMessage.className = 'empty-state';
            }
            if(clearTableHistoryBtn) clearTableHistoryBtn.disabled = true;
            if(printReceiptBtn) printReceiptBtn.disabled = true;
            if(downloadReceiptBtn) downloadReceiptBtn.disabled = true;
            return;
        }

        if(clearTableHistoryBtn) clearTableHistoryBtn.disabled = false;
        if(printReceiptBtn) printReceiptBtn.disabled = false;
        if(downloadReceiptBtn) downloadReceiptBtn.disabled = false;

        orders.forEach(order => {
            const orderDiv = document.createElement('div');
            orderDiv.classList.add('modal-order-item');
            orderDiv.innerHTML = `
                <h4>Order ID: ${order._id.substring(0, 8)}... (Status: <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>)</h4>
                <ul>
                    ${order.items.map(item => `
                        <li>
                            ${item.menuItemId.imageUrl ? `<img src="${item.menuItemId.imageUrl}" class="modal-item-img" alt="${item.menuItemId.name}">` : ''}
                            <span>${item.menuItemId.name} x ${item.quantity} ($${item.menuItemId.price.toFixed(2)})</span>
                            ${item.remark ? `<p class="admin-item-remark">Note: ${item.remark}</p>` : ''}
                        </li>
                    `).join('')}
                </ul>
                <div class="modal-order-actions">
                    <select class="order-status-select" data-order-id="${order._id}">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            `;
            if(modalOrderListDiv) modalOrderListDiv.appendChild(orderDiv);
        });

        if(modalOrderListDiv) {
            modalOrderListDiv.querySelectorAll('.order-status-select').forEach(select => {
                select.addEventListener('change', async (e) => {
                    const orderId = e.target.dataset.orderId;
                    const newStatus = e.target.value;
                    try {
                        await api.orders.updateOrderStatus(orderId, newStatus);
                        if(modalOrdersMessage) {
                            modalOrdersMessage.textContent = `Order ${orderId.substring(0, 8)}... status updated to ${newStatus}.`;
                            modalOrdersMessage.className = 'message success-message';
                        }
                        fetchAndDisplayOrders();
                        const updatedOrdersForModal = await api.orders.getStoreOrders().then(orders => orders.filter(o => o.tableId === tableId));
                        displayOrderDetailsModal(tableId, updatedOrdersForModal);
                    } catch (error) {
                        console.error('Error updating order status:', error);
                        if(modalOrdersMessage) {
                            modalOrdersMessage.textContent = 'Failed to update status: ' + (error.message || 'Server error');
                            modalOrdersMessage.className = 'error-error-message';
                        }
                    }
                });
            });
        }
        if(clearTableHistoryBtn) {
            clearTableHistoryBtn.dataset.tableId = tableId;
            clearTableHistoryBtn.disabled = false;
        }

        if(orderDetailsModal) {
            orderDetailsModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }

    function generateReceiptHtml(orders, storeInfo) {
        let itemsHtml = '';
        let subtotal = 0;
        
        const allItems = orders.flatMap(order => order.items);
        
        allItems.forEach(item => {
            const itemPrice = item.menuItemId.price * item.quantity;
            subtotal += itemPrice;
            itemsHtml += `
                <tr>
                    <td>
                        ${item.menuItemId.name} x ${item.quantity}
                        ${item.remark ? `<br><small>(${item.remark})</small>` : ''}
                    </td>
                    <td>$${itemPrice.toFixed(2)}</td>
                </tr>
            `;
        });
        
        const storeName = storeInfo.name || "SHOP NAME";
        const storeAddress = storeInfo.address || "No Address Provided";
        const storePhone = storeInfo.phone || "No Phone Provided";

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt for Table ${orders[0].tableId}</title>
                <style>
                    body { font-family: 'monospace', 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
                    .receipt-container { width: 300px; margin: 0 auto; border: 1px dashed #ccc; padding: 10px; }
                    .header, .footer { text-align: center; margin-bottom: 15px; }
                    .header h2 { margin: 0; font-size: 1.5em; }
                    .info { font-size: 0.9em; margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                    table th, table td { padding: 5px 0; text-align: left; }
                    table th:last-child, table td:last-child { text-align: right; }
                    .divider { border-top: 1px dashed #000; margin: 15px 0; }
                    .total-line { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px; font-size: 1.1em;}
                    .payment-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .thank-you { text-align: center; font-weight: bold; margin-top: 20px; font-size: 1.2em; }
                    @media print {
                        body { background-color: #fff; }
                        .receipt-container { border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="header">
                        <h2>${storeName}</h2>
                        <div class="info">
                            Address: ${storeAddress}<br>
                            Telp: ${storePhone}
                        </div>
                    </div>
                    <div class="divider">******************************</div>
                    <div class="header">
                        <h3> RECEIPT</h3>
                    </div>
                    <div class="divider">******************************</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    <div class="divider">******************************</div>
                    <div class="total-line">
                        <span>Total</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="thank-you">THANK YOU!</div>
                </div>
            </body>
            </html>
        `;
    }

    function printReceipt() {
        if (!currentOrdersForModal || currentOrdersForModal.length === 0 || !currentStoreDetails) {
            modalOrdersMessage.textContent = 'No order data available for printing.';
            modalOrdersMessage.className = 'message error-error-message';
            return;
        }

        const receiptHtml = generateReceiptHtml(currentOrdersForModal, currentStoreDetails);
        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptHtml);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    function downloadReceipt() {
        if (!currentOrdersForModal || currentOrdersForModal.length === 0 || !currentStoreDetails) {
            modalOrdersMessage.textContent = 'No order data available for download.';
            modalOrdersMessage.className = 'message error-error-message';
            return;
        }

        const receiptHtml = generateReceiptHtml(currentOrdersForModal, currentStoreDetails);
        const blob = new Blob([receiptHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const tableId = currentOrdersForModal[0] ? currentOrdersForModal[0].tableId : 'unknown';
        a.href = url;
        a.download = `receipt_table_${tableId}_${new Date().getTime()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function deleteAdmin(id) {
        const confirmDelete = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content product-quick-view-content">
                    <div class="modal-header">
                        <h2 class="section-title">Confirm Deletion</h2>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body quick-view-body">
                        <p>Are you sure you want to delete this admin?</p>
                        <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
                            <button class="primary-btn" id="confirmDeleteBtn">Delete</button>
                            <button class="secondary-btn" id="cancelDeleteBtn">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'flex';

            const closeBtn = modal.querySelector('.close-button');
            const confirmBtn = modal.querySelector('#confirmDeleteBtn');
            const cancelBtn = modal.querySelector('#cancelDeleteBtn');

            const closeModal = () => {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            };

            closeBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            confirmBtn.addEventListener('click', () => { closeModal(); resolve(true); });

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                    resolve(false);
                }
            });
        });

        if (!confirmDelete) {
            return;
        }
        try {
            await api.users.deleteAdmin(id);
            const successModal = document.createElement('div');
            successModal.classList.add('modal');
            successModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-check-circle confirmation-icon"></i>
                    <h2 class="section-title">Success!</h2>
                    <p>Admin deleted successfully!</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(successModal);
            successModal.style.display = 'flex';

            const okBtn = successModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                successModal.style.display = 'none';
                document.body.removeChild(successModal);
            });
            loadAdmins();
        } catch (error) {
            console.error('Error deleting admin:', error);
            const errorModal = document.createElement('div');
            errorModal.classList.add('modal');
            errorModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-times-circle confirmation-icon" style="color: #e74c3c;"></i>
                    <h2 class="section-title">Error!</h2>
                    <p>Failed to delete admin: ${error.message || 'Server error'}</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(errorModal);
            errorModal.style.display = 'flex';

            const okBtn = errorModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                errorModal.style.display = 'none';
                document.body.removeChild(errorModal);
            });
        }
    }

    async function deleteTable(id) {
        const confirmDelete = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content product-quick-view-content">
                    <div class="modal-header">
                        <h2 class="section-title">Confirm Deletion</h2>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body quick-view-body">
                        <p>Are you sure you want to delete this table? This will also clear associated orders.</p>
                        <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
                            <button class="primary-btn" id="confirmDeleteBtn">Delete</button>
                            <button class="secondary-btn" id="cancelDeleteBtn">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'flex';

            const closeBtn = modal.querySelector('.close-button');
            const confirmBtn = modal.querySelector('#confirmDeleteBtn');
            const cancelBtn = modal.querySelector('#cancelDeleteBtn');

            const closeModal = () => {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            };

            closeBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            confirmBtn.addEventListener('click', () => { closeModal(); resolve(true); });

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                    resolve(false);
                }
            });
        });

        if (!confirmDelete) {
            return;
        }
        try {
            await api.tables.deleteTable(id);
            const successModal = document.createElement('div');
            successModal.classList.add('modal');
            successModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-check-circle confirmation-icon"></i>
                    <h2 class="section-title">Success!</h2>
                    <p>Table deleted successfully!</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(successModal);
            successModal.style.display = 'flex';

            const okBtn = successModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                successModal.style.display = 'none';
                document.body.removeChild(successModal);
            });
            loadTables();
            fetchAndDisplayOrders();
        } catch (error) {
            console.error('Error deleting table:', error);
            const errorModal = document.createElement('div');
            errorModal.classList.add('modal');
            errorModal.innerHTML = `
                <div class="modal-content confirmation-content">
                    <i class="fas fa-times-circle confirmation-icon" style="color: #e74c3c;"></i>
                    <h2 class="section-title">Error!</h2>
                    <p>Failed to delete table: ${error.message || 'Server error'}</p>
                    <button class="primary-btn" id="okBtn">OK</button>
                </div>
            `;
            document.body.appendChild(errorModal);
            errorModal.style.display = 'flex';

            const okBtn = errorModal.querySelector('#okBtn');
            okBtn.addEventListener('click', () => {
                errorModal.style.display = 'none';
                document.body.removeChild(errorModal);
            });
        }
    }

    async function clearTableOrders(tableId) {
        const confirmClear = await new Promise(resolve => {
            const modal = document.createElement('div');
            modal.classList.add('modal');
            modal.innerHTML = `
                <div class="modal-content product-quick-view-content">
                    <div class="modal-header">
                        <h2 class="section-title">Confirm Clear Orders</h2>
                        <span class="close-button">&times;</span>
                    </div>
                    <div class="modal-body quick-view-body">
                        <p>Are you sure you want to clear all active orders for Table ${tableId}? This action cannot be undone.</p>
                        <div style="display: flex; gap: 10px; justify-content: center; width: 100%;">
                            <button class="primary-btn" id="confirmClearBtn">Clear Orders</button>
                            <button class="secondary-btn" id="cancelClearBtn">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.style.display = 'flex';

            const closeBtn = modal.querySelector('.close-button');
            const confirmBtn = modal.querySelector('#confirmClearBtn');
            const cancelBtn = modal.querySelector('#cancelClearBtn');

            const closeModal = () => {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            };

            closeBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            cancelBtn.addEventListener('click', () => { closeModal(); resolve(false); });
            confirmBtn.addEventListener('click', () => { closeModal(); resolve(true); });

            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    closeModal();
                    resolve(false);
                }
            });
        });

        if (!confirmClear) {
            return;
        }

        try {
            const response = await api.orders.clearTableOrders(tableId);
            if (modalOrdersMessage) {
                modalOrdersMessage.textContent = response.message;
                modalOrdersMessage.className = 'message success-message';
            }
            setTimeout(() => {
                if(orderDetailsModal) orderDetailsModal.style.display = 'none';
                document.body.classList.remove('modal-open');
                if(modalOrdersMessage) modalOrdersMessage.textContent = '';
            }, 2000);
            
            fetchAndDisplayOrders();
        } catch (error) {
            console.error('Error clearing table orders:', error);
            if(modalOrdersMessage) {
                modalOrdersMessage.textContent = 'Failed to clear orders: ' + (error.message || 'Server error');
                modalOrdersMessage.className = 'error-error-message';
            }
        }
    }

    if (closeOrderDetailsModalBtn) {
        closeOrderDetailsModalBtn.addEventListener('click', () => {
            if(orderDetailsModal) orderDetailsModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }

    if (orderDetailsModal) {
        window.addEventListener('click', (event) => {
            if (event.target == orderDetailsModal) {
                orderDetailsModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }

    if(clearTableHistoryBtn) {
        clearTableHistoryBtn.addEventListener('click', async (e) => {
            const tableIdToClear = e.target.dataset.tableId;
            if (tableIdToClear) {
                await clearTableOrders(tableIdToClear);
            }
        });
    }
    
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener('click', printReceipt);
    }
    if (downloadReceiptBtn) {
        downloadReceiptBtn.addEventListener('click', downloadReceipt);
    }

    if (storeInfoForm) {
        storeInfoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            
            formData.append('name', storeNameInputBranding.value.trim());
            formData.append('address', storeAddressInput.value.trim());
            formData.append('phone', storePhoneInput.value.trim());

            if (storeLogoInput.files[0]) {
                formData.append('logo', storeLogoInput.files[0]);
            }

            console.log('FormData being sent:');
            for (const pair of formData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }

            const originalBtnText = updateStoreInfoBtn.textContent;
            setLoading(updateStoreInfoBtn, true);

            try {
                await api.stores.updateStore(storeId, formData);
                storeLogoMessage.textContent = 'Store information and logo updated successfully!';
                storeLogoMessage.className = 'success-message';
                storeLogoInput.value = null;
                await loadStoreDetails();
            } catch (error) {
                console.error('Error updating store info:', error);
                storeLogoMessage.textContent = 'Failed to update store info: ' + (error.message || 'Server error');
                storeLogoMessage.className = 'error-error-message';
            } finally {
                setLoading(updateStoreInfoBtn, false);
                updateStoreInfoBtn.textContent = originalBtnText;
            }
        });
        
        if (storeLogoInput) {
            storeLogoInput.addEventListener('change', () => {
                const file = storeLogoInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        logoPreviewImg.src = e.target.result;
                        logoPreviewImg.classList.remove('hidden');
                        logoPreviewContainer.style.border = 'none';
                    };
                    reader.readAsDataURL(file);
                } else {
                    logoPreviewImg.src = '';
                    logoPreviewImg.classList.add('hidden');
                    logoPreviewContainer.style.border = '2px dashed #bdc3c7';
                }
            });
        }
    }

    if (addTableForm) {
        addTableForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newTableId = newTableIdInput.value.trim();
            if (!newTableId) {
                addTableMessage.textContent = 'Table ID cannot be empty.';
                addTableMessage.className = 'error-error-message';
                return;
            }

            const submitBtn = document.querySelector('#addTableForm button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            setLoading(submitBtn, true);

            try {
                const data = await api.tables.addTable({ tableId: newTableId }); 
                addTableMessage.textContent = data.message;
                addTableMessage.className = 'success-message';
                newTableIdInput.value = '';
                await loadTables();
            } catch (error) {
                console.error('Error adding table:', error);
                addTableMessage.textContent = 'Failed to add table: ' + (error.message || 'Server error');
                addTableMessage.className = 'error-error-message';
            } finally {
                setLoading(submitBtn, false);
                submitBtn.textContent = originalBtnText;
            }
        });
    }

    if (role === 'superadmin') {
        if (document.getElementById('tab-stores')) document.getElementById('tab-stores').style.display = 'none';
        if (document.getElementById('tab-users')) document.getElementById('tab-users').style.display = 'none';
    } else if (role === 'admin') {
        const adminTabs = ['overview', 'categories', 'menu', 'branding', 'tables', 'orders'];
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
            if (!adminTabs.includes(btn.dataset.tab)) {
                btn.style.display = 'none';
            }
        });
    }
    
    if (role === 'admin' || role === 'superadmin') {
        await loadStoreDetails();
        await loadStoreLogo();
        await loadTables();
        await loadCategories();
        await loadMenuItems();
        
        if (role === 'admin') {
            fetchAndDisplayOrders();
            setInterval(fetchAndDisplayOrders, 5000);
        }
    }

    if (window.innerWidth >= 768 && window.innerWidth <= 1023) {
        if (sidebar) sidebar.classList.add('collapsed');
    }
    updateMainContentMargin();
});