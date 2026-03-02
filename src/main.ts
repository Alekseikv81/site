// Mobile menu toggle
import { renderCatalogPage } from './catalog';
import { renderPharmaciesPage } from './pharmacies';
import { renderPublicOfferPage } from './public_offer';
import { renderPrivacyPolicyPage } from './privacy_policy';
import { renderConsentPersonalDataPage } from './consent_personal_data';
import { renderConditionsPage } from './umovy_prodazhu_ta_povernennya';
import { renderOrdersPage, getCartItemsCount } from './orders';
import { replaceVerificationLinks } from './pharmacyVerificationButton';

// Объявление интерфейса Window для TypeScript
declare global {
  interface Window {
    addAccessibilityControls: () => void;
    addToCartAndUpdate: (name: string, manufacturer: string, price: number) => void;
  }
}

// Объявляем функции в глобальном контексте
function getCookie(name: string): string | undefined {
  const cookies = document.cookie.split(';');
  for (const cookieStr of cookies) {
    const cookie = cookieStr.trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return undefined;
}

function setCookie(name: string, value: string, options: Record<string, unknown> = {}): void {
  options = {
    path: '/',
    ...options
  };
  
  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }
  
  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
  for (const optionKey in options) {
    updatedCookie += "; " + optionKey;
    const optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }
  
  document.cookie = updatedCookie;
}

// Функции для поддержки доступности
let fontSize = 'sm';
let themeColor = 'white';

function setFontSize(): void {
  const savedFont = getCookie('font') || fontSize;
  document.documentElement.setAttribute('data-font', savedFont);
  
  document.querySelectorAll('.j-font').forEach(btn => {
    btn.classList.remove('show');
    if (btn.classList.contains(savedFont)) {
      btn.classList.add('show');
    }
  });
}

function setThemeColor(): void {
  const savedTheme = getCookie('theme') || themeColor;
  document.documentElement.setAttribute('data-theme', savedTheme);
  document.body.setAttribute('data-theme', savedTheme);
  
  document.querySelectorAll('.j-theme').forEach(btn => {
    btn.classList.remove('show');
    if (btn.classList.contains(savedTheme)) {
      btn.classList.add('show');
    }
  });
  
  analyzeAndFixContrast();
}

function analyzeAndFixContrast() {
  const elements = document.querySelectorAll('*');
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'white';
  
  let backgroundColor = '';
  switch (currentTheme) {
    case 'white':
      backgroundColor = 'rgb(255, 255, 255)';
      break;
    case 'black':
      backgroundColor = 'rgb(0, 0, 0)';
      break;
    case 'blue':
      backgroundColor = 'rgb(9, 24, 51)';
      break;
    case 'brown':
      backgroundColor = 'rgb(59, 41, 22)';
      break;
    case 'green':
      backgroundColor = 'rgb(28, 67, 15)';
      break;
  }
  
  elements.forEach(el => {
    if (el.tagName === 'BUTTON' || el.tagName === 'A' || el.tagName === 'INPUT') {
      const computedStyle = window.getComputedStyle(el);
      const color = computedStyle.color;
      
      if (color && backgroundColor) {
        const contrastRatio = getContrastRatio(color, backgroundColor);
        
        if (contrastRatio < 4.5) {
          const bgRGB = getRGB(backgroundColor);
          if (bgRGB) {
            const newColor = getContrastColor(bgRGB);
            (el as HTMLElement).style.color = newColor;
          }
        }
      }
    }
  });
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = getRGB(color1);
  const rgb2 = getRGB(color2);
  
  if (!rgb1 || !rgb2) return 1; // Fallback for invalid colors
  
  const lum1 = calculateLuminance(rgb1);
  const lum2 = calculateLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function getRGB(color: string): RGB | null {
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  const hexMatch = color.match(/#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    };
  }
  
  return null;
}

function calculateLuminance(rgb: RGB): number {
  const rgbNormalized = {
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255
  };
  
  const rgbCorrected = {
    r: rgbNormalized.r <= 0.03928 ? rgbNormalized.r / 12.92 : Math.pow((rgbNormalized.r + 0.055) / 1.055, 2.4),
    g: rgbNormalized.g <= 0.03928 ? rgbNormalized.g / 12.92 : Math.pow((rgbNormalized.g + 0.055) / 1.055, 2.4),
    b: rgbNormalized.b <= 0.03928 ? rgbNormalized.b / 12.92 : Math.pow((rgbNormalized.b + 0.055) / 1.055, 2.4)
  };
  
  return 0.2126 * rgbCorrected.r + 0.7152 * rgbCorrected.g + 0.0722 * rgbCorrected.b;
}

function getContrastColor(bgRGB: RGB): string {
  const whiteLuminance = calculateLuminance({ r: 255, g: 255, b: 255 });
  const blackLuminance = calculateLuminance({ r: 0, g: 0, b: 0 });
  const bgLuminance = calculateLuminance(bgRGB);
  
  const whiteContrast = (whiteLuminance + 0.05) / (bgLuminance + 0.05);
  const blackContrast = (bgLuminance + 0.05) / (blackLuminance + 0.05);
  
  return whiteContrast > blackContrast ? 'white' : 'black';
}

function addAccessibilityTopPanel(): void {
  const body = document.querySelector('body');
  if (!body) return;
  
  const panel = document.createElement('div');
  panel.className = 'accessibility-top-panel';
  panel.innerHTML = `
    <div class="dashboard-title">Шрифт:</div>
    <ul class="dashboard-list">
      <li><button class="dashboard-btn j-font sm" id="j-font-sm"><span>A</span></button></li>
      <li><button class="dashboard-btn j-font md show" id="j-font-md"><span>A</span></button></li>
      <li><button class="dashboard-btn j-font lg" id="j-font-lg"><span>A</span></button></li>
    </ul>
    <div class="dashboard-title">Цвет:</div>
    <ul class="dashboard-list">
      <li><button class="dashboard-btn j-theme white show" id="j-theme-white"><span>Ц</span></button></li>
      <li><button class="dashboard-btn j-theme black" id="j-theme-black"><span>Ц</span></button></li>
      <li><button class="dashboard-btn j-theme blue" id="j-theme-blue"><span>Ц</span></button></li>
      <li><button class="dashboard-btn j-theme brown" id="j-theme-brown"><span>Ц</span></button></li>
      <li><button class="dashboard-btn j-theme green" id="j-theme-green"><span>Ц</span></button></li>
    </ul>
    <button class="dashboard-btn j-dashboard-hide" id="j-dashboard-hide"><span>×</span></button>
  `;
  body.appendChild(panel);
  
  setupAccessibilityTopPanelListeners();
}

function setupAccessibilityTopPanelListeners(): void {
  const topThemeButtons = document.querySelectorAll('.accessibility-top-panel .j-theme');
  const topFontButtons = document.querySelectorAll('.accessibility-top-panel .j-font');
  const topDashboardHide = document.querySelector('.accessibility-top-panel .j-dashboard-hide');
  
  topThemeButtons.forEach(button => {
    button.addEventListener('click', () => {
      let themeColor = 'white';
      
      if (button.classList.contains('black')) {
        themeColor = 'black';
      } else if (button.classList.contains('blue')) {
        themeColor = 'blue';
      } else if (button.classList.contains('brown')) {
        themeColor = 'brown';
      } else if (button.classList.contains('green')) {
        themeColor = 'green';
      }
      
      setCookie('theme', themeColor, {'max-age': 3600*24*30});
      
      topThemeButtons.forEach(btn => {
        btn.classList.remove('show');
      });
      button.classList.add('show');
      
      setThemeColor();
      
      // Синхронизируем с нижней панелью
      const mainThemeButtons = document.querySelectorAll('.dashboard .j-theme');
      mainThemeButtons.forEach(btn => {
        btn.classList.remove('show');
        if (btn.classList.contains(themeColor)) {
          btn.classList.add('show');
        }
      });
    });
  });
  
  topFontButtons.forEach(button => {
    button.addEventListener('click', () => {
      let fontSize = 'md';
      
      if (button.classList.contains('sm')) {
        fontSize = 'sm';
      } else if (button.classList.contains('lg')) {
        fontSize = 'lg';
      }
      
      setCookie('font', fontSize, {'max-age': 3600*24*30});
      
      topFontButtons.forEach(btn => {
        btn.classList.remove('show');
      });
      button.classList.add('show');
      
      setFontSize();
      
      // Синхронизируем с нижней панелью
      const mainFontButtons = document.querySelectorAll('.dashboard .j-font');
      mainFontButtons.forEach(btn => {
        btn.classList.remove('show');
        if (btn.classList.contains(fontSize)) {
          btn.classList.add('show');
        }
      });
    });
  });
  
  if (topDashboardHide) {
    topDashboardHide.addEventListener('click', () => {
      // Clear all accessibility-related attributes
      document.documentElement.setAttribute('data-theme', '');
      document.body.setAttribute('data-theme', '');
      document.documentElement.setAttribute('data-font', '');
      document.querySelector('.base')?.classList.remove('dashboard-show');
      document.querySelector('.accessibility-top-panel')?.remove();
      
      // Update button text
      document.querySelectorAll('.accessibility-button').forEach(btn => {
        btn.innerHTML = '<span class="accessibility-icon">👓</span> Людям з порушенням зору';
      });
      
      // Clear all accessibility cookies by setting to empty and expiring them
      setCookie('dashboard_show', 'false', {'max-age': 3600*24*30});
      setCookie('theme', '', {'max-age': 0});
      setCookie('font', '', {'max-age': 0});
      
      // Reset variables to default
      themeColor = 'white';
      fontSize = 'md';
      
      // Focus on the accessibility button without page reload
      const button = document.querySelector('.accessibility-button');
      if (button) {
        (button as HTMLElement).focus();
      }
    });
  }
}

// Функция для настройки обработчиков кнопок шрифта и темы в dashboard
function setupDashboardButtonsListeners(): void {
  // Обработчики для кнопок темы в dashboard
  const dashboardThemeButtons = document.querySelectorAll('.dashboard .j-theme');
  dashboardThemeButtons.forEach(button => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = button.cloneNode(true) as HTMLElement;
    if (button.parentNode) {
      button.parentNode.replaceChild(clone, button);
    }
    
    clone.addEventListener('click', () => {
      let selectedTheme = 'white';
      
      if (clone.classList.contains('black')) {
        selectedTheme = 'black';
      } else if (clone.classList.contains('blue')) {
        selectedTheme = 'blue';
      } else if (clone.classList.contains('brown')) {
        selectedTheme = 'brown';
      } else if (clone.classList.contains('green')) {
        selectedTheme = 'green';
      }
      
      setCookie('theme', selectedTheme, {'max-age': 3600*24*30});
      
      // Обновляем состояние кнопок в dashboard
      const allDashboardThemeButtons = document.querySelectorAll('.dashboard .j-theme');
      allDashboardThemeButtons.forEach(btn => {
        btn.classList.remove('show');
      });
      clone.classList.add('show');
      
      setThemeColor();
      
      // Синхронизируем с верхней панелью
      const topThemeButtons = document.querySelectorAll('.accessibility-top-panel .j-theme');
      topThemeButtons.forEach(btn => {
        btn.classList.remove('show');
        if (btn.classList.contains(selectedTheme)) {
          btn.classList.add('show');
        }
      });
    });
  });
  
  // Обработчики для кнопок шрифта в dashboard
  const dashboardFontButtons = document.querySelectorAll('.dashboard .j-font');
  dashboardFontButtons.forEach(button => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = button.cloneNode(true) as HTMLElement;
    if (button.parentNode) {
      button.parentNode.replaceChild(clone, button);
    }
    
    clone.addEventListener('click', () => {
      let selectedFont = 'md';
      
      if (clone.classList.contains('sm')) {
        selectedFont = 'sm';
      } else if (clone.classList.contains('lg')) {
        selectedFont = 'lg';
      }
      
      setCookie('font', selectedFont, {'max-age': 3600*24*30});
      
      // Обновляем состояние кнопок в dashboard
      const allDashboardFontButtons = document.querySelectorAll('.dashboard .j-font');
      allDashboardFontButtons.forEach(btn => {
        btn.classList.remove('show');
      });
      clone.classList.add('show');
      
      setFontSize();
      
      // Синхронизируем с верхней панелью
      const topFontButtons = document.querySelectorAll('.accessibility-top-panel .j-font');
      topFontButtons.forEach(btn => {
        btn.classList.remove('show');
        if (btn.classList.contains(selectedFont)) {
          btn.classList.add('show');
        }
      });
    });
  });
}

// Функция для генерации breadcrumbs
function generateBreadcrumbs(currentPath: string): string {
  const breadcrumbs: { name: string; path: string }[] = [
    { name: 'Головна', path: '/' }
  ];

  const pathMap: Record<string, string> = {
    '/catalog': 'Каталог товарів',
    '/umovy_prodazhu_ta_povernennya': 'Умови продажу, оплати та повернення',
    '/delivery': 'Доставка',
    '/pharmacies': 'Наші аптеки',
    '/public_offer': 'Умови публічної оферти',
    '/privacy_policy': 'Політика конфіденційності',
    '/consent_personal_data': 'Згода на обробку персональних даних',
    '/orders': 'Кошик'
  };

  const normalizedPath = currentPath.endsWith('/') && currentPath !== '/' 
    ? currentPath.slice(0, -1) 
    : currentPath;

  if (normalizedPath !== '/' && pathMap[normalizedPath]) {
    breadcrumbs.push({ name: pathMap[normalizedPath], path: normalizedPath });
  }

  return `
    <nav class="breadcrumbs" aria-label="Навігаційні посилання">
      <ol class="breadcrumbs-list">
        ${breadcrumbs.map((crumb, index) => `
          <li class="breadcrumbs-item">
            ${index === breadcrumbs.length - 1 
              ? `<span class="breadcrumbs-current" aria-current="page">${crumb.name}</span>`
              : `<a href="${crumb.path}" class="breadcrumbs-link">${crumb.name}</a>`
            }
          </li>
        `).join('')}
      </ol>
    </nav>
  `;
}

// Функция для кнопки "Наверх"
function setupScrollToTop(): void {
  // Создаем кнопку "Наверх"
  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.className = 'scroll-to-top';
  scrollToTopBtn.setAttribute('aria-label', 'Прокрутити вгору');
  scrollToTopBtn.innerHTML = '<span class="scroll-to-top-icon">↑</span>';
  scrollToTopBtn.style.display = 'none';
  document.body.appendChild(scrollToTopBtn);

  // Показываем/скрываем кнопку при прокрутке
  const toggleScrollButton = (): void => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.style.display = 'flex';
    } else {
      scrollToTopBtn.style.display = 'none';
    }
  };

  window.addEventListener('scroll', toggleScrollButton);

  // Обработчик клика - плавная прокрутка наверх
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Функция для управления мобильным меню
function setupMobileMenu(): void {
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  const body = document.body;

  // Открытие меню
  mobileMenuToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (mobileNav) {
      mobileNav.classList.add('active');
      body.classList.add('menu-opened');
      // Блокируем скролл фона
      body.style.overflow = 'hidden';
    }
  });

  // Закрытие меню
  const closeMobileMenu = (): void => {
    if (mobileNav) {
      mobileNav.classList.remove('active');
      body.classList.remove('menu-opened');
      body.style.overflow = '';
    }
  };

  mobileMenuClose?.addEventListener('click', closeMobileMenu);

  // Закрытие при клике на затемненную область
  mobileNav?.addEventListener('click', (e) => {
    if (e.target === mobileNav) {
      closeMobileMenu();
    }
  });

  // Закрытие при клике на ссылку в меню
  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      // Небольшая задержка для плавного перехода
      setTimeout(closeMobileMenu, 100);
    });
  });

  // Закрытие при нажатии Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('active')) {
      closeMobileMenu();
    }
  });
}

export function setupPageAfterRender(): void {
  const dashboardShow = document.querySelectorAll('.j-dashboard-show');
  const dashboardHide = document.querySelectorAll('.j-dashboard-hide');
  const dashboard = document.querySelector('.dashboard');
  const dashboardSettings = document.querySelector('.j-dashboard-settings');
  
  // Настраиваем мобильное меню
  setupMobileMenu();
  
  // Настраиваем кнопку "Наверх"
  setupScrollToTop();
  
  dashboardShow.forEach(button => {
    button.addEventListener('click', () => {
      setCookie('dashboard_show', 'true', {'max-age': 3600*24*30});
      document.querySelector('.base')?.classList.add('dashboard-show');
      
      if (!document.querySelector('.accessibility-top-panel')) {
        addAccessibilityTopPanel();
      }
    });
  });
  
  dashboardHide.forEach(button => {
    button.addEventListener('click', () => {
      // Clear all accessibility-related attributes
      document.documentElement.setAttribute('data-theme', '');
      document.body.setAttribute('data-theme', '');
      document.documentElement.setAttribute('data-font', '');
      document.querySelector('.base')?.classList.remove('dashboard-show');
      
      const topPanel = document.querySelector('.accessibility-top-panel');
      if (topPanel) {
        topPanel.remove();
      }
      
      // Update button text
      document.querySelectorAll('.accessibility-button').forEach(btn => {
        btn.innerHTML = '<span class="accessibility-icon">👓</span> Людям з порушенням зору';
      });
      // Clear all accessibility cookies by setting to empty and expiring them
      setCookie('dashboard_show', 'false', {'max-age': 3600*24*30});
      setCookie('theme', '', {'max-age': 0});
      setCookie('font', '', {'max-age': 0});
      
      // Reset variables to default
      themeColor = 'white';
      fontSize = 'md';
      
      // Focus on the accessibility button without page reload
      const button = document.querySelector('.accessibility-button');
      if (button) {
        (button as HTMLElement).focus();
      }
    });
  });
  
  if (dashboardSettings) {
    dashboardSettings.addEventListener('click', () => {
      dashboard?.classList.toggle('dashboard-settings-show');
    });
  }
  
  // Настраиваем обработчики для кнопок шрифта и темы в dashboard
  setupDashboardButtonsListeners();
  
  if (getCookie('dashboard_show') === 'true') {
    document.querySelector('.base')?.classList.add('dashboard-show');
    
    if (!document.querySelector('.accessibility-top-panel')) {
      addAccessibilityTopPanel();
    }
  }
  
  // Replace verification links with the new button
  replaceVerificationLinks();
}

// Add this function to handle both enabling and disabling accessibility mode
function toggleAccessibilityMode(enable: boolean): void {
  if (enable) {
    // Enable accessibility mode
    document.querySelector('.base')?.classList.add('dashboard-show');
    
    // Always set high contrast theme (black) when enabling accessibility mode
    setCookie('theme', 'black', {'max-age': 3600*24*30});
    themeColor = 'black';
    
    setThemeColor();
    setFontSize();
    
    if (!document.querySelector('.accessibility-top-panel')) {
      addAccessibilityTopPanel();
    }
    
    document.querySelectorAll('.accessibility-button').forEach(btn => {
      btn.innerHTML = '<span class="accessibility-icon">👓</span> Вимкнути режим';
    });
    
    setCookie('dashboard_show', 'true', {'max-age': 3600*24*30});
  } else {
    // Disable accessibility mode
    document.documentElement.setAttribute('data-theme', '');
    document.body.setAttribute('data-theme', '');
    document.documentElement.setAttribute('data-font', '');
    document.querySelector('.base')?.classList.remove('dashboard-show');
    
    const topPanel = document.querySelector('.accessibility-top-panel');
    if (topPanel) {
      topPanel.remove();
    }
    
    document.querySelectorAll('.accessibility-button').forEach(btn => {
      btn.innerHTML = '<span class="accessibility-icon">👓</span> Людям з порушенням зору';
    });
    
    setCookie('dashboard_show', 'false', {'max-age': 3600*24*30});
    setCookie('theme', '', {'max-age': 0});
    setCookie('font', '', {'max-age': 0});
    
    // Reset variables to default
    themeColor = 'white';
    fontSize = 'md';
    
    // Apply theme changes without page reload
    setThemeColor();
    setFontSize();
  }
}

// Обновлённая функция для настройки слушателей кнопок доступности
function setupAccessibilityButtonListeners(): void {
  // Находим все кнопки включения режима доступности
  const accessibilityButtons = document.querySelectorAll('.accessibility-button, .j-dashboard-show');
  
  accessibilityButtons.forEach(button => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = button.cloneNode(true);
    if (button.parentNode) {
      button.parentNode.replaceChild(clone, button);
    }
    
    // Добавляем новый обработчик
    clone.addEventListener('click', () => {
      // Если режим доступности выключен, включаем его
      if (getCookie('dashboard_show') !== 'true') {
        toggleAccessibilityMode(true);
      } else {
        // Если режим доступности включен, выключаем его
        toggleAccessibilityMode(false);
      }
    });
  });
  
  // Находим все кнопки выключения режима доступности
  const dashboardHideButtons = document.querySelectorAll('.j-dashboard-hide');
  
  dashboardHideButtons.forEach(button => {
    // Удаляем старые обработчики
    const clone = button.cloneNode(true);
    if (button.parentNode) {
      button.parentNode.replaceChild(clone, button);
    }
    
    // Добавляем новый обработчик
    clone.addEventListener('click', () => {
      toggleAccessibilityMode(false);
    });
  });
}

// Функция для добавления элементов управления доступностью
export function addAccessibilityControls(): void {
  // Настраиваем слушатели для кнопок
  setupAccessibilityButtonListeners();
  
  // Если режим доступности включен, применяем настройки
  if (getCookie('dashboard_show') === 'true') {
    toggleAccessibilityMode(true);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Note: .j-mobile-btn is not used in the current HTML structure
  // Mobile navigation is handled via CSS classes (.mobile-nav.active)

  function handleFirstTab(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
      window.addEventListener('mousedown', handleMouseDownOnce);
    }
  }
  
  function handleMouseDownOnce() {
    document.body.classList.remove('user-is-tabbing');
    document.body.classList.add('mouse-user');
    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
  }
  
  window.addEventListener('keydown', handleFirstTab);
  
  if (document.querySelector('.dashboard')) {
    document.querySelector('.dashboard')?.setAttribute('role', 'region');
    document.querySelector('.dashboard')?.setAttribute('aria-label', 'Налаштування доступності');
  }
  
  document.querySelectorAll('.dashboard-btn').forEach(btn => {
    btn.setAttribute('role', 'button');
    if (btn.classList.contains('j-font')) {
      btn.setAttribute('aria-label', 'Змінити розмір шрифту');
    } else if (btn.classList.contains('j-theme')) {
      btn.setAttribute('aria-label', 'Змінити кольорову схему');
    }
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('reset_dashboard') === 'true') {
    setCookie('dashboard_show', 'false', {'max-age': 3600*24*30});
    window.location.href = window.location.pathname;
  }

  // Call our function to set up buttons after all page content is loaded
  const path = window.location.pathname;
  if (path === '/umovy_prodazhu_ta_povernennya' || path === '/umovy_prodazhu_ta_povernennya/') {
    renderConditionsPage(addAccessibilityControls);
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/delivery' || path === '/delivery/') {
    renderDeliveryPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/catalog' || path === '/catalog/') {
    renderCatalogPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/order' || path === '/order/') {
    renderOrdersPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/orders' || path === '/orders/') {
    renderOrdersPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/pharmacies' || path === '/pharmacies/') {
    renderPharmaciesPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/public_offer' || path === '/public_offer/') {
    renderPublicOfferPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/privacy_policy' || path === '/privacy_policy/') {
    renderPrivacyPolicyPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else if (path === '/consent_personal_data' || path === '/consent_personal_data/') {
    renderConsentPersonalDataPage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  } else {
    renderHomePage();
    setTimeout(() => {
      addAccessibilityControls();
    }, 100);
  }

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link.getAttribute('href') && !link.getAttribute('target') && !link.getAttribute('href')?.startsWith('http')) {
      e.preventDefault();
      const href = link.getAttribute('href');
      
      if (href === '/umovy_prodazhu_ta_povernennya' || href === '/umovy_prodazhu_ta_povernennya/') {
        window.history.pushState({}, '', href);
        renderConditionsPage(addAccessibilityControls);
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/delivery' || href === '/delivery/') {
        window.history.pushState({}, '', href);
        renderDeliveryPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/catalog' || href === '/catalog/') {
        window.history.pushState({}, '', href);
        renderCatalogPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/order' || href === '/order/') {
        window.history.pushState({}, '', href);
        renderOrdersPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/orders' || href === '/orders/') {
        window.history.pushState({}, '', href);
        renderOrdersPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/pharmacies' || href === '/pharmacies/') {
        window.history.pushState({}, '', href);
        renderPharmaciesPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/public_offer' || href === '/public_offer/') {
        window.history.pushState({}, '', href);
        renderPublicOfferPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/privacy_policy' || href === '/privacy_policy/') {
        window.history.pushState({}, '', href);
        renderPrivacyPolicyPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/consent_personal_data' || href === '/consent_personal_data/') {
        window.history.pushState({}, '', href);
        renderConsentPersonalDataPage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      } else if (href === '/') {
        window.history.pushState({}, '', href);
        renderHomePage();
        setTimeout(() => {
          addAccessibilityControls();
        }, 100);
      }
    }
  });

  // Add this to ensure all accessibility buttons have event listeners
  setupAccessibilityButtonListeners();
  
  // Ensure accessibility mode is properly applied if enabled
  if (getCookie('dashboard_show') === 'true') {
    toggleAccessibilityMode(true);
  }
  
  addAccessibilityControls();
});

function renderHomePage(): void {
  const root = document.getElementById('root');
  if (!root) return;

  // Get cart count for displaying badges
  const cartItemsCount = getCartItemsCount(); // Assuming getCartItemsCount is available here

  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.querySelector('a')?.getAttribute('href') === '/') {
      item.classList.add('active');
    }
  });

  root.innerHTML = `
    <div class="mobile-nav">
      <div class="mobile-nav__wrapper">
        <div class="mobile-nav__body">
          <div class="mobile-nav__header">
            <a href="/" class="mobile-nav__logo">
              <!-- Логотип удален -->
            </a>
            <button class="mobile-menu-close" aria-label="Закрити меню" type="button">
              <span class="mobile-menu-close__icon">×</span>
            </button>
          </div>
          <nav class="sidebar">
            <ul>
              <ul id="top-nav-ul1" class="top-menu">
                <li class="menu-item active"><a href="/">Про нас</a></li>
                <li class="menu-item"><a href="/catalog">Каталог товарів</a></li>
                <li class="menu-item"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу, оплати та повернення</a></li>
                <li class="menu-item"><a href="/delivery">Доставка</a></li>
              </ul>
              <ul id="top-nav-ul2" class="top-menu">
                <li class="menu-item"><a href="/pharmacies">Наші аптеки</a></li>
              </ul>
              <ul id="top-nav-ul3" class="top-menu">
                <li class="menu-item"><a href="/public_offer">Умови публічної оферти</a></li>
                <li class="menu-item"><a href="/privacy_policy">Політика конфіденційності</a></li>
                <li class="menu-item"><a href="/consent_personal_data">Згода на обробку персональних даних</a></li>
              </ul>
              <ul id="top-nav-verify" class="top-menu">
                <li class="menu-item"><a href="https://www.dls.gov.ua/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80-%D1%81%D1%83%D0%B1%D1%94%D0%BA%D1%82%D1%96%D0%B2-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D1%8F%D0%BA%D1%96/" target="_blank" class="verify-link">Перевір легальність роботи аптеки</a></li>
                <li class="menu-item"><button class="accessibility-button static-accessibility-button j-dashboard-show"><span class="accessibility-icon">👓</span> Людям з порушенням зору</button></li>
                <li class="menu-item">
                  <a href="/orders" class="btn-base btn-medium btn-primary cart-link">
                    <div class="cart-icon">🛒</div>
                    <span>Оформити замовлення</span>
                    <div class="cart-count">${cartItemsCount}</div>
                  </a>
                </li>
              </ul>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <div class="base">
      <div class="dashboard">
        <div>
          <div class="dashboard-row">
            <button class="btn --outline-white j-dashboard-hide" type="button"><i class="icon-desktop"></i>Перейти до звичайної версії</button>
          </div>
        </div>
        <div>
          <div class="dashboard-title">Шрифт:</div>
          <ul class="dashboard-list">
            <li>
              <button class="dashboard-btn j-font sm" id="j-font-sm"><span>A</span></button>
            </li>
            <li>
              <button class="dashboard-btn j-font md show" id="j-font-md"><span>A</span></button>
            </li>
            <li>
              <button class="dashboard-btn j-font lg" id="j-font-lg"><span>A</span></button>
            </li>
          </ul>
        </div>
        <div>
          <div class="dashboard-settings">
            <div class="dashboard-title">Цвет:</div>
            <ul class="dashboard-list">
              <li>
                <button class="dashboard-btn j-theme white show" id="j-theme-white"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme black" id="j-theme-black"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme blue" id="j-theme-blue"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme brown" id="j-theme-brown"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme green" id="j-theme-green"><span>Ц</span></button>
              </li>
            </ul>
            <p class="dashboard-info">Згідно вимог визначених ДСТУ ISO/IEC 40500:2015 <br>«Інформаційні технології. Настанова з доступності <br>веб-контенту W3C (WCAG) 2.0»</p>
          </div>
        </div>
        <div class="dashboard-settings-title j-dashboard-settings"><span class="dashboard-settings-show"><i class="icon-chevron-down"></i>Показать все </span><span class="dashboard-settings-hide"><i class="icon-chevron-up"></i>свернуть</span></div>
      </div>

      <div class="top-right-logo">
        <!-- Логотип удален -->
      </div>

      <header class="main-header">
        <button class="mobile-menu-toggle" aria-label="Відкрити меню" type="button">
          <span class="mobile-menu-toggle__icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </header>

      <div class="content">
        <div class="two-column-layout">
          <div class="sidebar-column">
            <a href="/">
              <!-- Логотип удален -->
            </a>
            <nav class="main-sidebar">
              <ul class="main-menu">
                <li class="menu-item active"><a href="/">Про нас</a></li>
                <li class="menu-item"><a href="/catalog">Каталог товарів</a></li>
                <li class="menu-item"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу, оплати та повернення</a></li>
                <li class="menu-item"><a href="/delivery">Доставка</a></li>
                <li class="menu-item"><a href="/pharmacies">Наші аптеки</a></li>
                <li class="menu-item"><a href="/public_offer">Умови публічної оферти</a></li>
                <li class="menu-item"><a href="/privacy_policy">Політика конфіденційності</a></li>
                <li class="menu-item"><a href="/consent_personal_data">Згода на обробку персональних даних</a></li>
                <li class="menu-item"><a href="https://www.dls.gov.ua/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80-%D1%81%D1%83%D0%B1%D1%94%D0%BA%D1%82%D1%96%D0%B2-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D1%8F%D0%BA%D1%96/" target="_blank" class="verify-link">Перевір легальність роботи аптеки</a></li>
                <li class="menu-item"><button class="accessibility-button static-accessibility-button j-dashboard-show"><span class="accessibility-icon">👓</span> Людям з порушенням зору</button></li>
                <li class="menu-item">
                  <a href="/orders" class="btn-base btn-medium btn-primary cart-link">
                    <div class="cart-icon">🛒</div>
                    <span>Оформити замовлення</span>
                    <div class="cart-count">${cartItemsCount}</div>
                  </a>
                </li>
              </ul>
            </nav>
            <div class="sidebar-footer">
              <p>Адреса: м. Київ, вул. Новодарницька, 6</p>
              <p>Електронна пошта: <a href="mailto:info@liki.darnytsia.ua">info@liki.darnytsia.ua</a></p>
              <p>Телефон: +380 (50) 301 00 32</p>
              <div class="footer-copyright">© ${new Date().getFullYear()}. ПРАТ «ФАРМАЦЕВТИЧНА ФІРМА „ДАРНИЦЯ"»</div>
            </div>
          </div>
          
          <div class="content-column">
            <div class="content__document">
              ${generateBreadcrumbs('/')}
              <h1>ПрАТ «Фармацевтична фірма «Дарниця»</h1>
              <p class="intro-text">Аптека "Дарниця" пропонує широкий асортимент лікарських засобів, виробів медичного призначення, косметики та інших товарів для здоров'я. Ми піклуємося про ваше здоров'я і комфорт.</p>
              
              <h2>Про нас</h2>
              <p>Акціонерне товариство «Дарниця» - сучасна фармацевтична компанія, лідер фармацевтичного ринку України за обсягами виробництва ліків у натуральному вираженні. Кожна п'ята упаковка ліків, які купуються в Україні - виробництва «Дарниці». Компанія випускає більше 250 найменувань ліків 15 фармакологічних груп.</p>
              
              <h2>Ліцензія</h2>
              <p>Номер: Б/Н від 28.05.2020</p>
              
              <h2>Наші цінності</h2>
              <ul>
                <li><strong>Якість</strong> - контроль якості медикаментів на всіх етапах виробництва</li>
                <li><strong>Інновації</strong> - постійно вдосконалюємо процеси та технології</li>
                <li><strong>Доступність</strong> - забезпечуємо доступні ціни на лікарські засоби</li>
                <li><strong>Професіоналізм</strong> - кваліфікований персонал і консультації</li>
              </ul>
              
              <h2>Основні напрямки діяльності</h2>
              <p>Компанія має збалансований та диверсифікований портфель готових лікарських засобів в аптечному сегменті, який складається з 400 найменувань продукції.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  addAccessibilityControls();
  
  // Setup page-specific event listeners
  setupPageAfterRender();
}

export function renderDeliveryPage(): void {
  const root = document.getElementById('root');
  if (!root) return;

  // Get cart count for displaying badges
  const cartItemsCount = getCartItemsCount();

  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.querySelector('a')?.getAttribute('href') === '/delivery') {
      item.classList.add('active');
    }
  });

  root.innerHTML = `
    <div class="mobile-nav">
      <div class="mobile-nav__wrapper">
        <div class="mobile-nav__body">
          <div class="mobile-nav__header">
            <a href="/" class="mobile-nav__logo">
              <!-- Логотип удален -->
            </a>
            <button class="mobile-menu-close" aria-label="Закрити меню" type="button">
              <span class="mobile-menu-close__icon">×</span>
            </button>
          </div>
          <nav class="sidebar">
            <ul>
              <ul id="top-nav-ul1" class="top-menu">
                <li class="menu-item"><a href="/">Про нас</a></li>
                <li class="menu-item"><a href="/catalog">Каталог товарів</a></li>
                <li class="menu-item"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу, оплати та повернення</a></li>
                <li class="menu-item active"><a href="/delivery">Доставка</a></li>
              </ul>
              <ul id="top-nav-ul2" class="top-menu">
                <li class="menu-item"><a href="/pharmacies">Наші аптеки</a></li>
              </ul>
              <ul id="top-nav-ul3" class="top-menu">
                <li class="menu-item"><a href="/public_offer">Умови публічної оферти</a></li>
                <li class="menu-item"><a href="/privacy_policy">Політика конфіденційності</a></li>
                <li class="menu-item"><a href="/consent_personal_data">Згода на обробку персональних даних</a></li>
              </ul>
              <ul id="top-nav-verify" class="top-menu">
                <li class="menu-item"><a href="https://www.dls.gov.ua/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80-%D1%81%D1%83%D0%B1%D1%94%D0%BA%D1%82%D1%96%D0%B2-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D1%8F%D0%BA%D1%96/" target="_blank" class="verify-link">Перевір легальність роботи аптеки</a></li>
                <li class="menu-item"><button class="accessibility-button static-accessibility-button j-dashboard-show"><span class="accessibility-icon">👓</span> Людям з порушенням зору</button></li>
                <li class="menu-item">
                  <a href="/orders" class="btn-base btn-medium btn-primary cart-link">
                    <div class="cart-icon">🛒</div>
                    <span>Оформити замовлення</span>
                    <div class="cart-count">${cartItemsCount}</div>
                  </a>
                </li>
              </ul>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <div class="base">
      <div class="dashboard">
        <div>
          <div class="dashboard-row">
            <button class="btn --outline-white j-dashboard-hide" type="button"><i class="icon-desktop"></i>Перейти до звичайної версії</button>
          </div>
        </div>
        <div>
          <div class="dashboard-title">Шрифт:</div>
          <ul class="dashboard-list">
            <li>
              <button class="dashboard-btn j-font sm" id="j-font-sm"><span>A</span></button>
            </li>
            <li>
              <button class="dashboard-btn j-font md show" id="j-font-md"><span>A</span></button>
            </li>
            <li>
              <button class="dashboard-btn j-font lg" id="j-font-lg"><span>A</span></button>
            </li>
          </ul>
        </div>
        <div>
          <div class="dashboard-settings">
            <div class="dashboard-title">Цвет:</div>
            <ul class="dashboard-list">
              <li>
                <button class="dashboard-btn j-theme white show" id="j-theme-white"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme black" id="j-theme-black"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme blue" id="j-theme-blue"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme brown" id="j-theme-brown"><span>Ц</span></button>
              </li>
              <li>
                <button class="dashboard-btn j-theme green" id="j-theme-green"><span>Ц</span></button>
              </li>
            </ul>
            <p class="dashboard-info">Згідно вимог визначених ДСТУ ISO/IEC 40500:2015 <br>«Інформаційні технології. Настанова з доступності <br>веб-контенту W3C (WCAG) 2.0»</p>
          </div>
        </div>
        <div class="dashboard-settings-title j-dashboard-settings"><span class="dashboard-settings-show"><i class="icon-chevron-down"></i>Показать все </span><span class="dashboard-settings-hide"><i class="icon-chevron-up"></i>свернуть</span></div>
      </div>

      <div class="top-right-logo">
        <!-- Логотип удален -->
      </div>

      <header class="main-header">
        <button class="mobile-menu-toggle" aria-label="Відкрити меню" type="button">
          <span class="mobile-menu-toggle__icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </header>

      <div class="content">
        <div class="two-column-layout">
          <div class="sidebar-column">
            <a href="/">
              <!-- Логотип удален -->
            </a>
            <nav class="main-sidebar">
              <ul class="main-menu">
                <li class="menu-item"><a href="/">Про нас</a></li>
                <li class="menu-item"><a href="/catalog">Каталог товарів</a></li>
                <li class="menu-item"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу, оплати та повернення</a></li>
                <li class="menu-item active"><a href="/delivery">Доставка</a></li>
                <li class="menu-item"><a href="/pharmacies">Наші аптеки</a></li>
                <li class="menu-item"><a href="/public_offer">Умови публічної оферти</a></li>
                <li class="menu-item"><a href="/privacy_policy">Політика конфіденційності</a></li>
                <li class="menu-item"><a href="/consent_personal_data">Згода на обробку персональних даних</a></li>
                <li class="menu-item"><a href="https://www.dls.gov.ua/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80-%D1%81%D1%83%D0%B1%D1%94%D0%BA%D1%82%D1%96%D0%B2-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D1%8F%D0%BA%D1%96/" target="_blank" class="verify-link">Перевір легальність роботи аптеки</a></li>
                <li class="menu-item"><button class="accessibility-button static-accessibility-button j-dashboard-show"><span class="accessibility-icon">👓</span> Людям з порушенням зору</button></li>
                <li class="menu-item">
                  <a href="/orders" class="btn-base btn-medium btn-primary cart-link">
                    <div class="cart-icon">🛒</div>
                    <span>Оформити замовлення</span>
                    <div class="cart-count">${cartItemsCount}</div>
                  </a>
                </li>
              </ul>
            </nav>
            <div class="sidebar-footer">
              <p>Адреса: м. Київ, вул. Новодарницька, 6</p>
              <p>Електронна пошта: <a href="mailto:info@liki.darnytsia.ua">info@liki.darnytsia.ua</a></p>
              <p>Телефон: +380 (50) 301 00 32</p>
              <div class="footer-copyright">© ${new Date().getFullYear()}. ПРАТ «ФАРМАЦЕВТИЧНА ФІРМА „ДАРНИЦЯ"»</div>
            </div>
          </div>
          
          <div class="content-column">
            <div class="content__document">
              ${generateBreadcrumbs('/delivery')}
              <h1>Доставка</h1>
              
              <h2>Способи отримання замовлення:</h2>
              <p>Ви можете отримати своє замовлення одним з наступних способів:</p>
              
              <h3>1. Самовивіз із аптеки</h3>
              <p>Забрати замовлення можна з будь-якої з наших аптек. Ви можете обрати найзручнішу для вас аптеку при оформленні замовлення. Замовлення буде доставлено протягом 24 годин (для аптек у м. Києві) або 1-3 робочих днів (для аптек в інших містах України).</p>
              
              <h3>2. Доставка кур'єром</h3>
              <p>Доставка здійснюється кур'єром до дверей за адресою, вказаною при оформленні замовлення:</p>
              <ul>
                <li><strong>Київ</strong> - доставка в день замовлення або наступного дня</li>
                <li><strong>Інші міста України</strong> - доставка протягом 1-3 робочих днів</li>
              </ul>
              
              <h3>3. Доставка поштовими операторами</h3>
              <p>У партнерстві з:</p>
              <ul>
                <li><strong>Нова Пошта</strong> - доставка відділення-відділення, до поштомату або адресна доставка по Україні протягом 1-3 робочих днів</li>
                <li><strong>Укрпошта</strong> - доставка до відділення по всій території України протягом 3-7 робочих днів</li>
              </ul>
              
              <h2>Термін доставки</h2>
              <p>Терміни доставки можуть бути змінені в залежності від наявності товару на складі, завантаженості служб доставки та інших факторів. Актуальний термін доставки повідомляється клієнту при оформленні замовлення.</p>
              
              <h2>Вартість доставки</h2>
              <ul>
                <li><strong>Самовивіз з аптеки</strong> - безкоштовно</li>
                <li><strong>Доставка кур'єром по Києву</strong> - безкоштовно при замовленні від 500 грн, 50 грн при замовленні до 500 грн</li>
                <li><strong>Нова Пошта</strong> - згідно з тарифами перевізника</li>
                <li><strong>Укрпошта</strong> - згідно з тарифами перевізника</li>
              </ul>
              
              <h2>Зверніть увагу!</h2>
              <p>З огляду на особливості законодавства України, не всі товари можуть бути доставлені поштою. Деякі категорії лікарських засобів відпускаються лише за рецептом лікаря і можуть бути придбані тільки при особистому візиті до аптеки.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  addAccessibilityControls();
  
  // Setup page-specific event listeners
  setupPageAfterRender();
}

// Для обеспечения доступа из window
window.addAccessibilityControls = addAccessibilityControls;
