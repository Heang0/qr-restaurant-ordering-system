// Function to check if user is authenticated and redirect
export function checkAuthAndRedirect() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const path = window.location.pathname; // Gets path like '/index.html'

    // List of publicly accessible pages that DON'T require a login.
    // 'index.html' is now the public homepage. 'superadmin.html' and 'admin.html' are NOT public.
    const publicPages = ['/index.html', '/login.html', '/order.html']; // Updated 'home.html' to 'index.html'

    // Scenario 1: User is NOT authenticated (no token)
    if (!token) {
        // If the current path is NOT one of the public pages (i.e., it's a protected page like /admin.html or /superadmin.html),
        // redirect them to the public homepage (/index.html).
        if (!publicPages.some(publicPath => path.includes(publicPath))) {
            window.location.href = 'index.html'; // Redirect to the new homepage
            return false; // Indicate a redirect happened
        }
        // If they are on a public page (e.g., /index.html, /login.html), allow them to stay.
        return true; // No redirect needed
    }

    // Scenario 2: User IS authenticated (token exists)
    // Always ensure authenticated users are on their *correct* dashboard.
    // If they are on a public page (like index.html or login.html) while authenticated,
    // or on the wrong dashboard, redirect them to their specific dashboard.

    if (role === 'superadmin') {
        // If superadmin is NOT on their superadmin dashboard, redirect them there.
        if (!path.includes('superadmin.html')) {
            window.location.href = 'superadmin.html'; // Correctly redirect to superadmin.html
            return false; // Indicate a redirect
        }
    } else if (role === 'admin') {
        // If admin is NOT on their admin dashboard, redirect them there.
        if (!path.includes('admin.html')) {
            window.location.href = 'admin.html'; // Correctly redirect to admin.html
            return false; // Indicate a redirect
        }
    }
    // For 'customer' role, they primarily use 'order.html' via QR code.
    // If an authenticated customer is on a public page (like index.html or login.html),
    // we allow them to stay, as there's no fixed "customer dashboard" in your current setup.

    // This specific block from your previous 'auth.js' was problematic due to 'redirectPath'
    // being undefined and its logic being redundant after the specific role checks above.
    // It is removed.

    // If we reach here, the user is authenticated and is either:
    // 1. On their correct dashboard page (superadmin.html or admin.html).
    // 2. A customer on an allowed public page (index.html, login.html, or order.html).
    return true; // No redirect needed, allow access
}

export function logout() {
    localStorage.clear(); // Clear all stored user data
    window.location.href = 'index.html'; // Redirect to the new homepage (index.html) after logout
}