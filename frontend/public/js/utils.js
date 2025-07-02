// This file assumes you've included a QR code library like 'qrcode.js' or 'qrcode'
// For this example, we'll assume a global `QRCode` object from a script tag.
// If not using a global library, you'd import it here if using a module bundler,
// or fetch it dynamically.

// For simple vanilla JS, you'd typically include qrcode.min.js in your HTML:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>

export function generateQrCode(text, elementId) { // ADDED 'export'
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID '${elementId}' not found for QR code generation.`);
        return;
    }
    element.innerHTML = ''; // Clear previous QR code
    new QRCode(element, {
        text: text,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}
