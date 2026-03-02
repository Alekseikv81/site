/**
 * This module provides a function to create the pharmacy verification button
 * that links to the official verification site and matches the required styling.
 */

/**
 * Creates an HTMLElement for the pharmacy verification button
 * according to the official specifications.
 * @returns HTMLElement - A clickable button element with the required styling
 */
export function createPharmacyVerificationButton(): HTMLElement {
  // Create container element
  const container = document.createElement('div');
  container.classList.add('pharmacy-verification-container');
  
  // Create button with required styling
  const button = document.createElement('button');
  button.classList.add('pharmacy-verification-official');
  
  // Create SVG content inside the button - more compact design with reduced height
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 50" class="pharmacy-svg-content">
      <rect x="1" y="1" width="298" height="48" rx="8" ry="8" fill="#FFFFFF" stroke="#009B4E" stroke-width="2" />
      
      <!-- Green Cross with curved line - smaller size, centered vertically -->
      <!-- Light green part (Pantone 2270 C) -->
      <rect x="15" y="11" width="30" height="8" rx="2" ry="2" fill="#6CC24A" />
      <rect x="26" y="1" width="8" height="28" rx="2" ry="2" fill="#6CC24A" />
      
      <!-- Dark green part (Pantone 7731 C) -->
      <rect x="15" y="11" width="19" height="8" rx="2" ry="2" fill="#009B4E" />
      <rect x="26" y="11" width="8" height="19" rx="2" ry="2" fill="#009B4E" />
      
      <!-- White curved line -->
      <path d="M26,11 Q32,15 34,19" stroke="#FFFFFF" stroke-width="1.5" fill="none" />
      
      <!-- Ukrainian Flag - Blue part (Pantone 2935 C), centered vertically -->
      <rect x="18" y="32" width="20" height="7" fill="#0057B8" />
      <!-- Ukrainian Flag - Yellow part (Pantone 012 C) -->
      <rect x="18" y="39" width="20" height="7" fill="#FFD700" />
      
      <!-- Text in green - positioned for better spacing -->
      <text x="50" y="20" font-family="Bookman Old Style, serif" font-size="14" fill="#009B4E" font-weight="bold">
        <tspan x="50" y="20">Перевір легальність</tspan>
        <tspan x="50" y="38">роботи аптеки</tspan>
      </text>
    </svg>
  `;
  
  // Add click event to open verification link
  button.addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://www.dls.gov.ua/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80-%D1%81%D1%83%D0%B1%D1%94%D0%BA%D1%82%D1%96%D0%B2-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D1%8F%D0%BA%D1%96/', '_blank');
  });
  
  container.appendChild(button);
  return container;
}

/**
 * Replaces all verification links with the pharmacy verification button
 * Only replaces links in the main sidebar menu, not in mobile menu or footer
 */
export function replaceVerificationLinks(): void {
  // Find verification links only in the main sidebar menu
  // This ensures the button stays in the menu and doesn't appear under the footer
  const mainMenu = document.querySelector('.main-menu');
  if (!mainMenu) {
    return; // Main menu not found, skip replacement
  }
  
  const verificationLinks = mainMenu.querySelectorAll('.verify-link');
  
  verificationLinks.forEach(link => {
    // Skip if this link is not actually a link element or is already replaced
    if (!(link instanceof HTMLElement) || link.closest('.pharmacy-verification-container')) {
      return;
    }
    
    const parentLi = link.closest('li');
    if (parentLi && parentLi.closest('.main-menu')) {
      // Double check: ensure this li is within main-menu and not in footer
      const mainMenu = parentLi.closest('.main-menu');
      const sidebarFooter = parentLi.closest('.sidebar-footer');
      
      if (!mainMenu || sidebarFooter) {
        return; // Skip if not in main menu or if somehow in footer
      }
      
      // Check if this element has already been replaced with a button
      // to prevent duplicate processing
      if (parentLi.querySelector('.pharmacy-verification-container')) {
        return; // Skip if already replaced
      }
      
      // Create new button
      const button = createPharmacyVerificationButton();
      
      // Replace the link with the button
      parentLi.innerHTML = '';
      parentLi.appendChild(button);
    }
  });
} 