// Function to check if user is authenticated and redirect
function checkAuthAndRedirect() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const path = window.location.pathname;

    if (!token) {
        if (!path.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return false;
    }

    if (role === 'superadmin' && !path.includes('index.html')) {
        window.location.href = 'index.html';
        return true;
    } else if (role === 'admin' && !path.includes('admin.html')) {
        window.location.href = 'admin.html';
        return true;
    } else if (role === 'customer' && !path.includes('order.html')) {
        // Customer pages are accessed via QR, not direct login.
        // This scenario is for direct access to order.html without QR params,
        // which should technically be handled differently or redirect to error.
        // For now, if someone somehow logs in as 'customer' (not part of this auth flow),
        // we'll just allow them on order.html.
        return true;
    }
    return true; // User is authenticated and on the correct page
}

function logout() {
    localStorage.clear(); // Clear all stored user data
    window.location.href = 'login.html';
}

// Attach logout to a button if it exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});