/**
 * This module provides a function to create the pharmacy verification logo
 * as per official requirements.
 */

// Import the SVG as a module so Vite handles the path correctly
import pharmacyLogoSvg from './images/pharmacy-verification-logo.svg';

/**
 * Creates an HTMLElement for the pharmacy verification logo
 * that meets the regulatory requirements:
 * - Specific color scheme
 * - Minimum width of 90 pixels
 * - Static display
 * - Proper pharmacy verification messaging
 */
export function createPharmacyVerificationLogo(width = 200): HTMLElement {
  // Create wrapper div
  const wrapper = document.createElement('div');
  wrapper.classList.add('pharmacy-verification-logo');
  wrapper.style.display = 'inline-block';
  
  // Set minimum width to meet regulatory requirements (90px minimum)
  const finalWidth = Math.max(width, 90);
  
  // Create image element
  const img = document.createElement('img');
  img.src = pharmacyLogoSvg;
  img.alt = 'Перевір легальність роботи аптеки';
  img.width = finalWidth;
  img.style.width = `${finalWidth}px`;
  
  // Handle image load error - remove the wrapper if image fails to load
  img.onerror = () => {
    wrapper.remove();
  };
  
  // Add to wrapper
  wrapper.appendChild(img);
  
  return wrapper;
}

/**
 * Adds the pharmacy verification logo to a specified element
 * @param container - Element where the logo should be added
 * @param width - Width of the logo (will be at least 90px)
 */
export function addPharmacyVerificationLogo(
  container: HTMLElement, 
  width = 200
): void {
  const logo = createPharmacyVerificationLogo(width);
  container.appendChild(logo);
} 