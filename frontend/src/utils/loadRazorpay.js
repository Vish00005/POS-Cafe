/**
 * Dynamically loads the Razorpay checkout.js script.
 * Returns a Promise<boolean> — true if loaded, false if failed.
 */
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true); // already loaded

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
