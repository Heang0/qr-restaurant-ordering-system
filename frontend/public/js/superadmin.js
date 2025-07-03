import api from './api.js';
import { checkAuthAndRedirect, logout } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Attach logout button listener as early as possible within DOMContentLoaded
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Check authentication and redirect if necessary
    if (!checkAuthAndRedirect()) {
        console.log("Authentication check failed or redirected.");
        return; // Stop execution if not authorized
    }
    console.log("Authentication successful. Loading superadmin dashboard.");

    const role = localStorage.getItem('role');

    // Redirect non-superadmin roles to login
    if (role !== 'superadmin') {
        window.location.href = 'login.html';
        return;
    }

    // --- Elements ---
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

    const editAdminModal = document.getElementById('editAdminModal');
    const closeEditModalBtn = document.getElementById('closeEditModal');
    const editAdminForm = document.getElementById('editAdminForm');
    const editAdminIdInput = document.getElementById('editAdminId');
    const editAdminEmailInput = document.getElementById('editAdminEmail');
    const editAdminStoreSelect = document.getElementById('editAdminStore');
    const editAdminMessage = document.getElementById('editAdminMessage');

    // ADDED: Reset Password Modal Elements (ensure these are correctly defined)
    const resetPasswordModal = document.getElementById('resetPasswordModal');
    const closeResetPasswordModalBtn = document.getElementById('closeResetPasswordModal');
    const resetAdminEmailSpan = document.getElementById('resetAdminEmail');
    const resetAdminIdInput = document.getElementById('resetAdminId');
    const newAdminPasswordInput = document.getElementById('newAdminPassword');
    const confirmAdminPasswordInput = document.getElementById('confirmAdminPassword');
    const resetPasswordSubmitBtn = document.getElementById('resetPasswordSubmitBtn');
    const resetPasswordMessage = document.getElementById('resetPasswordMessage');
    // FIX: Ensure resetPasswordForm is correctly referenced at the top
    const resetPasswordForm = document.getElementById('resetPasswordForm');


    // Helper function for loading state for buttons
    function setLoading(button, isLoading) {
        if (isLoading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin loading-spinner"></i>';
            button.disabled = true;
            button.style.cursor = 'wait';
        } else {
            // Restore button text/content. This relies on the calling function to restore
            // the original text, as it's specific to each button.
            button.disabled = false;
            button.style.cursor = 'pointer';
        }
    }


    // --- Store Management ---
    createStoreForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = storeNameInput.value.trim();
        if (!name) return;

        const originalBtnText = createStoreForm.querySelector('button[type="submit"]').textContent;
        setLoading(createStoreForm.querySelector('button[type="submit"]'), true);

        try {
            const data = await api.stores.createStore(name);
            createStoreMessage.textContent = data.message;
            createStoreMessage.className = 'success-message';
            storeNameInput.value = ''; // Clear input
            await loadStores(); // Reload stores list
            await loadAdmins(); // Refresh admin store dropdown (important for assigning admins to new stores)
        } catch (error) {
            console.error('Error creating store:', error);
            createStoreMessage.textContent = 'Failed to create store: ' + (error.message || 'Server error');
            createStoreMessage.className = 'error-message';
        } finally {
            setLoading(createStoreForm.querySelector('button[type="submit"]'), false);
            createStoreForm.querySelector('button[type="submit"]').textContent = originalBtnText;
        }
    });

    async function loadStores() {
        try {
            const stores = await api.stores.getStores();
            adminStoreSelect.innerHTML = '';
            editAdminStoreSelect.innerHTML = ''; // Also populate for edit modal
            stores.forEach(store => {
                const option = document.createElement('option');
                option.value = store._id;
                option.textContent = store.name;
                adminStoreSelect.appendChild(option);
                editAdminStoreSelect.appendChild(option.cloneNode(true)); // Clone for edit modal
            });
        } catch (error) {
            console.error('Error loading stores:', error);
            createAdminMessage.textContent = 'Failed to load stores: ' + (error.message || 'Server error');
            createAdminMessage.className = 'error-message';
        }
    }

    // --- Admin Management ---
    createAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = adminEmailInput.value.trim();
        const password = adminPasswordInput.value;
        const storeId = adminStoreSelect.value;

        if (!email || !password || !storeId) {
            createAdminMessage.textContent = 'All fields are required.';
            createAdminMessage.className = 'error-message';
            return;
        }
        if (password.length < 6) {
            createAdminMessage.textContent = 'Password must be at least 6 characters long.';
            createAdminMessage.className = 'error-message';
            return;
        }

        const originalBtnText = createAdminForm.querySelector('button[type="submit"]').textContent;
        setLoading(createAdminForm.querySelector('button[type="submit"]'), true);

        try {
            const data = await api.users.createAdmin({ email, password, storeId });
            createAdminMessage.textContent = data.message;
            createAdminMessage.className = 'success-message';
            createAdminForm.reset(); // Clear form fields
            await loadAdmins(); // Reload admin list
        } catch (error) {
            console.error('Error creating admin:', error);
            createAdminMessage.textContent = 'Failed to create admin: ' + (error.message || 'Server error');
            createAdminMessage.className = 'error-message';
        } finally {
            setLoading(createAdminForm.querySelector('button[type="submit"]'), false);
            createAdminForm.querySelector('button[type="submit"]').textContent = originalBtnText;
        }
    });

    async function loadAdmins() {
        try {
            const admins = await api.users.getAdmins();
            adminsTableBody.innerHTML = '';
            if (admins.length === 0) {
                adminsTableBody.innerHTML = '<tr><td colspan="4">No admins found.</td></tr>'; // colspan 4 for new button
                return;
            }
            admins.forEach(admin => {
                const row = adminsTableBody.insertRow();
                row.insertCell(0).textContent = admin.email;
                row.insertCell(1).textContent = admin.storeId ? admin.storeId.name : 'N/A';
                const actionsCell = row.insertCell(2);
                actionsCell.classList.add('table-actions'); // Add class for styling buttons

                // Edit Button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.classList.add('secondary-btn');
                editButton.addEventListener('click', () => openEditAdminModal(admin._id, admin.email, admin.storeId ? admin.storeId._id : ''));
                actionsCell.appendChild(editButton);

                // ADDED: Reset Password Button
                const resetPasswordButton = document.createElement('button');
                resetPasswordButton.textContent = 'Reset Password';
                resetPasswordButton.classList.add('secondary-btn', 'reset-password-btn');
                resetPasswordButton.addEventListener('click', () => openResetPasswordModal(admin._id, admin.email));
                actionsCell.appendChild(resetPasswordButton);

                // Delete Button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-btn');
                deleteButton.addEventListener('click', () => deleteAdmin(admin._id));
                actionsCell.appendChild(deleteButton);
            });
            adminListMessage.textContent = '';
        } catch (error) {
            console.error('Error loading admins:', error); // Log the error
            adminListMessage.textContent = 'Failed to load admins: ' + (error.message || 'Server error');
            adminListMessage.className = 'error-message';
        }
    }

    async function deleteAdmin(id) {
        if (!confirm('Are you sure you want to delete this admin?')) {
            return;
        }
        try {
            await api.users.deleteAdmin(id);
            alert('Admin deleted successfully');
            loadAdmins();
        } catch (error) {
            console.error('Error deleting admin:', error);
            alert('Failed to delete admin: ' + (error.message || 'Server error'));
        }
    }

    // --- Edit Admin Modal ---
    function openEditAdminModal(adminId, adminEmail, adminStoreId) {
        if (editAdminModal) {
            editAdminIdInput.value = adminId;
            editAdminEmailInput.value = adminEmail;
            editAdminStoreSelect.value = adminStoreId;
            editAdminMessage.textContent = '';
            editAdminMessage.className = 'message';
            editAdminModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }

    if (closeEditModalBtn) {
        closeEditModalBtn.addEventListener('click', () => {
            if (editAdminModal) editAdminModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }

    if (editAdminModal) {
        window.addEventListener('click', (event) => {
            if (event.target == editAdminModal) {
                editAdminModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }

    editAdminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const adminId = editAdminIdInput.value;
        const newStoreId = editAdminStoreSelect.value;

        if (!newStoreId) {
            editAdminMessage.textContent = 'Please select a store.';
            editAdminMessage.className = 'error-message';
            return;
        }

        const originalBtnText = editAdminForm.querySelector('button[type="submit"]').textContent;
        setLoading(editAdminForm.querySelector('button[type="submit"]'), true);

        try {
            const data = await api.users.updateAdmin(adminId, { storeId: newStoreId });
            editAdminMessage.textContent = data.message;
            editAdminMessage.className = 'success-message';
            await loadAdmins(); // Reload admin list
            if (editAdminModal) editAdminModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        } catch (error) {
            console.error('Error updating admin:', error);
            editAdminMessage.textContent = 'Failed to update admin: ' + (error.message || 'Server error');
            editAdminMessage.className = 'error-message';
        } finally {
            setLoading(editAdminForm.querySelector('button[type="submit"]'), false);
            editAdminForm.querySelector('button[type="submit"]').textContent = originalBtnText;
        }
    });

    // --- ADDED: Reset Password Modal Functions ---
    function openResetPasswordModal(adminId, adminEmail) {
        if (resetPasswordModal) {
            resetAdminIdInput.value = adminId;
            resetAdminEmailSpan.textContent = adminEmail; // Display admin's email
            newAdminPasswordInput.value = ''; // Clear fields
            confirmAdminPasswordInput.value = ''; // Clear fields
            resetPasswordMessage.textContent = ''; // Clear messages
            resetPasswordMessage.className = 'message';
            resetPasswordModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        }
    }

    if (closeResetPasswordModalBtn) {
        closeResetPasswordModalBtn.addEventListener('click', () => {
            if (resetPasswordModal) resetPasswordModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    }

    if (resetPasswordModal) {
        window.addEventListener('click', (event) => {
            if (event.target == resetPasswordModal) {
                resetPasswordModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
    }

    // FIX: Ensure resetPasswordForm is referenced correctly before its event listener
    // This part is now handled by the const declaration at the top.
    // The event listener itself is correct.
    if (resetPasswordForm) { // Check if the element exists
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const adminId = resetAdminIdInput.value;
            const newPassword = newAdminPasswordInput.value;
            const confirmPassword = confirmAdminPasswordInput.value;

            if (!newPassword || !confirmPassword) {
                resetPasswordMessage.textContent = 'Please enter and confirm the new password.';
                resetPasswordMessage.className = 'error-message';
                return;
            }
            if (newPassword.length < 6) {
                resetPasswordMessage.textContent = 'New password must be at least 6 characters long.';
                resetPasswordMessage.className = 'error-message';
                return;
            }
            if (newPassword !== confirmPassword) {
                resetPasswordMessage.textContent = 'Passwords do not match.';
                resetPasswordMessage.className = 'error-message';
                return;
            }

            const originalBtnText = resetPasswordSubmitBtn.textContent;
            setLoading(resetPasswordSubmitBtn, true);

            try {
                const data = await api.users.resetAdminPassword(adminId, newPassword);
                resetPasswordMessage.textContent = data.message;
                resetPasswordMessage.className = 'success-message';
                // Optionally close modal after successful reset
                setTimeout(() => {
                    if (resetPasswordModal) resetPasswordModal.style.display = 'none';
                    document.body.classList.remove('modal-open');
                    resetPasswordForm.reset(); // Clear form fields
                }, 1500); // Close after 1.5 seconds
                
            } catch (error) {
                console.error('Error resetting admin password:', error);
                resetPasswordMessage.textContent = 'Failed to reset password: ' + (error.message || 'Server error');
                resetPasswordMessage.className = 'error-message';
            } finally {
                setLoading(resetPasswordSubmitBtn, false);
                resetPasswordSubmitBtn.textContent = originalBtnText;
            }
        });
    }


    // Initial loads
    loadStores(); // Load stores for admin creation dropdown
    loadAdmins(); // Load existing admins list
});
