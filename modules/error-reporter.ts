/**
 * Simple global error reporting system using direct DOM manipulation
 * No React state management - just vanilla JavaScript for simplicity
 *
 * Usage examples:
 *
 * // Basic error message
 * showError('Something went wrong');
 *
 * // API error with context
 * showApiError(error, 'Save board');
 *
 * // Custom duration (default is 5 seconds)
 * showError('Quick message', 2000);
 *
 * // Hide error immediately
 * hideError();
 */

let errorContainer: HTMLElement | null = null;

/**
 * Initialize the error container if it doesn't exist
 */
function initErrorContainer(): HTMLElement {
    if (errorContainer && document.body.contains(errorContainer)) {
        return errorContainer;
    }

    // Create error container
    errorContainer = document.createElement('div');
    errorContainer.id = 'global-error-container';
    errorContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff4444;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 80%;
        text-align: center;
        display: none;
    `;

    // Insert at the beginning of body to ensure it's on top
    document.body.insertBefore(errorContainer, document.body.firstChild);
    
    return errorContainer;
}

/**
 * Show an error message at the top center of the page
 * @param message - The error message to display
 * @param duration - How long to show the error in milliseconds (default: 5000)
 */
export function showError(message: string, duration: number = 5000): void {
    const container = initErrorContainer();
    
    // Set the error message
    container.textContent = message;
    
    // Show the error
    container.style.display = 'block';
    
    // Auto-hide after duration
    setTimeout(() => {
        if (container && document.body.contains(container)) {
            container.style.display = 'none';
        }
    }, duration);
}

/**
 * Hide the current error message immediately
 */
export function hideError(): void {
    if (errorContainer && document.body.contains(errorContainer)) {
        errorContainer.style.display = 'none';
    }
}

/**
 * Convenience function for API errors
 * @param error - Error object or string
 * @param context - Optional context about where the error occurred
 */
export function showApiError(error: any, context?: string): void {
    let message = 'An error occurred';
    
    if (typeof error === 'string') {
        message = error;
    } else if (error instanceof Error) {
        message = error.message;
    } else if (error && error.message) {
        message = error.message;
    }
    
    if (context) {
        message = `${context}: ${message}`;
    }
    
    showError(message);
}
