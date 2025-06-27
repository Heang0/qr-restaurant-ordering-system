document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuthAndRedirect()) {
        return; // Stop execution if not authorized
    }

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

    // Load Stores for Admin Creation
    async function loadStores() {
        try {
            const stores = await api.stores.getStores();
            adminStoreSelect.innerHTML = ''; // Clear previous options
            stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store._id;
                option.textContent = store.name;
                adminStoreSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading stores:', error);
            createAdminMessage.textContent = 'Failed to load stores: ' + (error.message || 'Server error');
            createAdminMessage.className = 'error-message';
        }
    }

    // Load Admins
    async function loadAdmins() {
        try {
            const admins = await api.users.getAdmins();
            adminsTableBody.innerHTML = '';
            if (admins.length === 0) {
                adminsTableBody.innerHTML = '<tr><td colspan="3">No admins found.</td></tr>';
                return;
            }
            admins.forEach(admin => {
                const row = adminsTableBody.insertRow();
                row.insertCell(0).textContent = admin.email;
                row.insertCell(1).textContent = admin.storeId ? admin.storeId.name : 'N/A';
                const actionsCell = row.insertCell(2);
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => deleteAdmin(admin._id));
                actionsCell.appendChild(deleteButton);
            });
            adminListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading admins:', error);
            adminListMessage.textContent = 'Failed to load admins: ' + (error.message || 'Server error');
            adminListMessage.className = 'error-message';
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
    createStoreForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const storeName = storeNameInput.value.trim();
        if (!storeName) return;

        try {
            const data = await api.stores.createStore(storeName);
            createStoreMessage.textContent = data.message;
            createStoreMessage.className = 'success-message';
            storeNameInput.value = '';
            await loadStores(); // Refresh stores list after creating new store
        } catch (error) {
            createStoreMessage.textContent = 'Error creating store: ' + (error.message || 'Server error');
            createStoreMessage.className = 'error-message';
        }
    });

    createAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = adminEmailInput.value.trim();
        const password = adminPasswordInput.value.trim();
        const storeId = adminStoreSelect.value;

        if (!email || !password || !storeId) {
            createAdminMessage.textContent = 'All fields are required.';
            createAdminMessage.className = 'error-message';
            return;
        }

        try {
            const data = await api.users.createAdmin({ email, password, storeId });
            createAdminMessage.textContent = data.message;
            createAdminMessage.className = 'success-message';
            adminEmailInput.value = '';
            adminPasswordInput.value = '';
            await loadAdmins(); // Refresh admin list
        } catch (error) {
            createAdminMessage.textContent = 'Error creating admin: ' + (error.message || 'Server error');
            createAdminMessage.className = 'error-message';
        }
    });

    // Initial loads
    await loadStores();
    await loadAdmins();
});