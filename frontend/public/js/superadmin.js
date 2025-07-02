import api from './api.js'; // ADDED THIS LINE: Import the api object
import { checkAuthAndRedirect, logout } from './auth.js'; // ADDED THIS LINE: Import auth functions

document.addEventListener('DOMContentLoaded', async () => {
    // Attach logout button listener as early as possible within DOMContentLoaded
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout); // Uses imported logout function
    }

    // Check authentication and redirect if necessary
    if (!checkAuthAndRedirect()) {
        console.log("Authentication check failed or redirected.");
        return; // Stop execution if not authorized
    }
    console.log("Authentication successful. Loading super admin dashboard.");

    const role = localStorage.getItem('role');
    if (role !== 'superadmin') {
        window.location.href = 'admin.html'; // Redirect non-superadmins
        return;
    }

    const createStoreForm = document.getElementById('createStoreForm');
    const storeNameInput = document.getElementById('storeName');
    const createStoreMessage = document.getElementById('createStoreMessage');

    const createAdminForm = document.getElementById('createAdminForm');
    const adminEmailInput = document.getElementById('adminEmail');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminStoreSelect = document.getElementById('adminStore');
    const createAdminMessage = document.getElementById('createAdminMessage');

    const adminsTableBody = document.querySelector('#adminsTable tbody');
    const adminListMessage = document.getElementById('adminListMessage');
    
    // CITE: Modal elements for edit admin
    const editAdminModal = document.getElementById('editAdminModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const editAdminForm = document.getElementById('editAdminForm');
    const editAdminIdInput = document.getElementById('editAdminId');
    const editAdminEmailInput = document.getElementById('editAdminEmail');
    const editAdminStoreSelect = document.getElementById('editAdminStore');
    const editAdminMessage = document.getElementById('editAdminMessage');

    let allStores = []; // Store all stores for the edit modal dropdown

    // Load Stores for Admin Creation & Edit Modal
    async function loadStores() {
        try {
            const stores = await api.stores.getStores();
            allStores = stores; // Store for later use
            
            if (adminStoreSelect) adminStoreSelect.innerHTML = '';
            if (editAdminStoreSelect) editAdminStoreSelect.innerHTML = '';
            
            stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store._id;
                option.textContent = store.name;
                if (adminStoreSelect) adminStoreSelect.appendChild(option);
                
                const option2 = option.cloneNode(true);
                if (editAdminStoreSelect) editAdminStoreSelect.appendChild(option2);
            });
        } catch (error) {
            console.error('Error loading stores:', error);
            if (createAdminMessage) {
                createAdminMessage.textContent = 'Failed to load stores: ' + (error.message || 'Server error');
                createAdminMessage.className = 'error-message';
            }
        }
    }

    // Load Admins
    async function loadAdmins() {
        try {
            const admins = await api.users.getAdmins();
            if (adminsTableBody) adminsTableBody.innerHTML = '';
            if (admins.length === 0) {
                if (adminsTableBody) adminsTableBody.innerHTML = '<tr><td colspan="3">No admins found.</td></tr>';
                return;
            }
            admins.forEach(admin => {
                const row = (adminsTableBody && adminsTableBody.insertRow) ? adminsTableBody.insertRow() : null;
                if (row) {
                    row.insertCell(0).textContent = admin.email;
                    row.insertCell(1).textContent = admin.storeId ? admin.storeId.name : 'N/A';
                    const actionsCell = row.insertCell(2);
                    actionsCell.classList.add('table-actions');
                    
                    // Add Edit button
                    const editButton = document.createElement('button');
                    editButton.innerHTML = '<i class="fas fa-edit"></i> Edit';
                    editButton.classList.add('secondary-btn');
                    editButton.addEventListener('click', () => editAdmin(admin._id));
                    
                    const deleteButton = document.createElement('button');
                    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
                    deleteButton.classList.add('delete-btn');
                    deleteButton.addEventListener('click', () => deleteAdmin(admin._id));
                    
                    actionsCell.appendChild(editButton);
                    actionsCell.appendChild(deleteButton);
                }
            });
            if (adminListMessage) adminListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading admins:', error);
            if (adminListMessage) {
                adminListMessage.textContent = 'Failed to load admins: ' + (error.message || 'Server error');
                adminListMessage.className = 'error-message';
            }
        }
    }
    
    // Function to populate the modal with admin data for editing
    async function editAdmin(adminId) {
        try {
            // Re-fetch admins to ensure we have the latest data if 'allStores' wasn't used for the current view.
            const admins = await api.users.getAdmins(); 
            const adminToEdit = admins.find(admin => admin._id === adminId);
            if (!adminToEdit) {
                alert('Admin not found!');
                return;
            }
            
            if (editAdminIdInput) editAdminIdInput.value = adminToEdit._id;
            if (editAdminEmailInput) editAdminEmailInput.value = adminToEdit.email;
            if (editAdminStoreSelect) editAdminStoreSelect.value = adminToEdit.storeId ? adminToEdit.storeId._id : '';
            
            if (editAdminMessage) editAdminMessage.textContent = ''; // Clear previous messages
            if (editAdminModal) editAdminModal.style.display = 'flex'; // Show the modal
        } catch (error) {
            console.error('Error fetching admin for edit:', error);
            alert('Failed to load admin data for editing.');
        }
    }
    
    // Function to handle updating an admin user
    async function handleUpdateAdmin(e) {
        e.preventDefault();
        const adminId = (editAdminIdInput) ? editAdminIdInput.value : '';
        const newStoreId = (editAdminStoreSelect) ? editAdminStoreSelect.value : '';
        
        try {
            const response = await api.users.updateAdmin(adminId, { storeId: newStoreId });
            if (editAdminMessage) {
                editAdminMessage.textContent = response.message;
                editAdminMessage.className = 'success-message';
            }
            
            // Refresh the admins list and close the modal after a delay
            setTimeout(() => {
                if (editAdminModal) editAdminModal.style.display = 'none';
                loadAdmins();
            }, 1500);
        } catch (error) {
            console.error('Error updating admin:', error);
            if (editAdminMessage) {
                editAdminMessage.textContent = 'Error updating admin: ' + (error.message || 'Server error');
                editAdminMessage.className = 'error-message';
            }
        }
    }

    // Delete Admin
    async function deleteAdmin(id) {
        if (!confirm('Are you sure you want to delete this admin?')) {
            return;
        }
        try {
            await api.users.deleteAdmin(id);
            alert('Admin deleted successfully');
            loadAdmins(); // Refresh the list
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert('Failed to delete admin: ' + (error.message || 'Server error'));
        }
    }

    // Event Listeners
    if (createStoreForm) {
        createStoreForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const storeName = storeNameInput.value.trim();
            if (!storeName) return;

            try {
                const data = await api.stores.createStore(storeName);
                if (createStoreMessage) {
                    createStoreMessage.textContent = data.message;
                    createStoreMessage.className = 'success-message';
                }
                if (storeNameInput) storeNameInput.value = '';
                await loadStores(); // Refresh stores list after creating new store
            } catch (error) {
                if (createStoreMessage) {
                    createStoreMessage.textContent = 'Error creating store: ' + (error.message || 'Server error');
                    createStoreMessage.className = 'error-message';
                }
            }
        });
    }

    if (createAdminForm) {
        createAdminForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = adminEmailInput.value.trim();
            const password = adminPasswordInput.value.trim();
            const storeId = adminStoreSelect.value;

            if (!email || !password || !storeId) {
                if (createAdminMessage) {
                    createAdminMessage.textContent = 'All fields are required.';
                    createAdminMessage.className = 'error-message';
                }
                return;
            }

            try {
                const data = await api.users.createAdmin({ email, password, storeId });
                if (createAdminMessage) {
                    createAdminMessage.textContent = data.message;
                    createAdminMessage.className = 'success-message';
                }
                if (adminEmailInput) adminEmailInput.value = '';
                if (adminPasswordInput) adminPasswordInput.value = '';
                await loadAdmins(); // Refresh admin list
            } catch (error) {
                if (createAdminMessage) {
                    createAdminMessage.textContent = 'Error creating admin: ' + (error.message || 'Server error');
                    createAdminMessage.className = 'error-message';
                }
            }
        });
    }

    // CITE: Modal event listeners
    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', () => {
            if (editAdminModal) editAdminModal.style.display = 'none';
        });
    }

    if (editAdminModal) {
        window.addEventListener('click', (event) => {
            if (event.target == editAdminModal) {
                if (editAdminModal) editAdminModal.style.display = 'none';
            }
        });
    }

    if (editAdminForm) {
        editAdminForm.addEventListener('submit', handleUpdateAdmin);
    }

    // Initial loads
    await loadStores();
    await loadAdmins();
});
