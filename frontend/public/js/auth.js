// Function to check if user is authenticated and redirect
export function checkAuthAndRedirect() { // ADDED 'export'
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

export function logout() { // ADDED 'export'
    localStorage.clear(); // Clear all stored user data
    window.location.href = 'login.html';
}

// REMOVED: Attaching logout to a button here. This will be handled by admin.js or index.html
// document.addEventListener('DOMContentLoaded', () => {
//     const logoutBtn = document.getElementById('logoutBtn');
//     if (logoutBtn) {
//         logoutBtn.addEventListener('click', logout);
//     }
// });
