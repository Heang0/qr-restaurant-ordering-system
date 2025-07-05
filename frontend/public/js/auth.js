// Function to check if user is authenticated and redirect
export function checkAuthAndRedirect() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    const path = window.location.pathname;

    // List of publicly accessible pages that DON'T require a login
    const publicPages = ['/home.html', '/login.html', '/order.html']; // CITE: Add home.html to public pages

    // If no token exists (user is not authenticated)
    if (!token) {
        // If the current path is NOT one of the public pages, then redirect to login.html (or home.html if home is the default landing)
        // Since home.html is now the desired landing for non-logged-in users,
        // we only redirect to login.html IF they try to access an admin/protected page directly.
        if (!publicPages.some(publicPath => path.includes(publicPath))) {
            // If they are on a protected page AND not logged in, redirect them to home.html
            window.location.href = 'home.html'; // CITE: Redirect to home.html instead of login.html for protected pages
            return false;
        }
        // If they are on a public page (like home.html or login.html), allow them to stay
        return true;
    }

    // If a token exists (user is authenticated), redirect based on role
    if (role === 'superadmin' && !path.includes('index.html')) {
        window.location.href = 'index.html';
        return false; // Redirecting, so return false
    } else if (role === 'admin' && !path.includes('admin.html')) {
        window.location.href = 'admin.html';
        return false; // Redirecting, so return false
    } else if (role === 'customer' && !path.includes('order.html')) {
        // This case is usually handled by QR code. If they somehow get here, allow it or redirect home.
        return true;
    }
    
    // If user is authenticated and on the correct page (or a public page), allow them to proceed.
    // For authenticated users, if they land on home.html, they should probably be redirected to their dashboard.
    if (path.includes('home.html')) {
       if (role === 'superadmin') {
    redirectPath = 'superadmin.html'; // Updated path for Super Admin
} else if (role === 'admin') {
    redirectPath = 'admin.html';
}
        // For 'customer' role, if they landed on home.html, it's fine as they mainly use order.html via QR.
        return false; // Indicate a redirect happened or should happen
    }

    return true; // User is authenticated and on the correct page
}

export function logout() {
    localStorage.clear(); // Clear all stored user data
    window.location.href = 'home.html'; // CITE: Redirect to home.html after logout
}

// Ensure checkAuthAndRedirect is called on every page load
// You will need to call this in each HTML file that needs authentication check
// e.g., in admin.js, index.js, etc.
// For home.html, you generally would NOT call checkAuthAndRedirect initially
// unless home.html needs to redirect *authenticated* users.
// The provided home.html does not call checkAuthAndRedirect, which is correct for a public landing page.