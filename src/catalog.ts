// Функция отрисовки страницы "Каталог товарів"
import { addToCart, getCartItemsCount, updateCartCounter } from './orders';
import { replaceVerificationLinks } from './pharmacyVerificationButton';
import { setupPageAfterRender } from './main';

// Интерфейс для структуры продукта из JSON
interface ProductData {
  "Опис матеріалу": string;
  "Ціна": number;
}

// Интерфейс для структуры JSON файла
interface CatalogData {
  products: ProductData[];
}

// Функция для загрузки данных из JSON
async function loadProductsFromJson(): Promise<ProductData[]> {
  try {
    const response = await fetch('/catalog.json');
    if (!response.ok) {
      const errorMessage = `Не вдалося завантажити каталог товарів. Статус: ${response.status} ${response.statusText}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    let data: CatalogData;
    try {
      const jsonText = await response.text();
      data = JSON.parse(jsonText);
    } catch (parseError) {
      const errorMessage = 'Помилка парсингу JSON файлу каталогу. Перевірте формат файлу catalog.json';
      console.error(errorMessage, parseError);
      throw new Error(errorMessage);
    }
    
    // Проверяем структуру данных
    if (!data || !Array.isArray(data.products)) {
      const errorMessage = 'Невірна структура даних у файлі каталогу. Очікується об\'єкт з полем "products"';
      console.error(errorMessage, data);
      throw new Error(errorMessage);
    }
    
    console.log('Loaded products from JSON:', data.products.length);
    
    // Фильтруем продукты с неопределенной ценой (NaN или null)
    const filteredProducts = data.products.filter(product => {
      const price = product["Ціна"];
      // Проверяем, что цена существует, является числом и не является NaN
      if (price === null || price === undefined) {
        console.warn('Filtered out product with null/undefined price:', product);
        return false;
      }
      if (typeof price !== 'number') {
        console.warn('Filtered out product with non-number price:', product, 'Type:', typeof price);
        return false;
      }
      if (isNaN(price) || !isFinite(price)) {
        console.warn('Filtered out product with NaN/Infinity price:', product, 'Price:', price);
        return false;
      }
      return true;
    });
    
    console.log('Filtered products (valid prices):', filteredProducts.length);
    
    if (filteredProducts.length === 0 && data.products.length > 0) {
      console.warn('Всі продукти були відфільтровані через невалідні ціни. Перевірте дані у catalog.json');
    }
    
    // Сортируем продукты по названию
    const sortedProducts = filteredProducts.sort((a, b) => a["Опис матеріалу"].localeCompare(b["Опис матеріалу"], 'uk'));
    return sortedProducts;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Невідома помилка при завантаженні каталогу';
    console.error('Error loading catalog data:', errorMessage, error);
    return [];
  }
}

// Отрисовка каталога товаров
export async function renderCatalogPage(): Promise<void> {
  try {
    const root = document.getElementById('root');
    if (!root) {
        console.error('Root element #root not found!');
        return;
    }

    // Показываем индикатор загрузки
    root.innerHTML = `
      <div class="content">
        <div class="two-column-layout">
          <div class="sidebar-column">
            <nav class="main-sidebar">
              <ul class="main-menu">
                <li class="menu-item"><a href="/">Про нас</a></li>
                <li class="menu-item active"><a href="/catalog">Каталог товарів</a></li>
                <li class="menu-item"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу</a></li>
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
                    <div class="cart-count">${getCartItemsCount()}</div>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div class="content-column">
            <div class="content__document">
              <h1>Каталог товарів</h1>
              <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Завантаження каталогу...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Получаем данные о товарах из JSON
    const products = await loadProductsFromJson();
    
    console.log('Products loaded for rendering:', products.length);
    
    if (products.length === 0) {
      console.warn('No products found! Check catalog.json file and browser console for details.');
      root.innerHTML = `
        <div class="content">
          <div class="content__document">
            <h1>Каталог товарів</h1>
            <div class="otc-info-box">
              <p><strong>Увага:</strong> У каталозі представлені тільки безрецептурні лікарські засоби.</p>
            </div>
            <p>На жаль, не вдалося завантажити товари з каталогу.</p>
            <p>Можливі причини:</p>
            <ul>
              <li>Файл каталогу недоступний або пошкоджений</li>
              <li>Всі товари мають невалідні дані про ціни</li>
              <li>Проблеми з мережею</li>
            </ul>
            <p>Будь ласка, спробуйте:</p>
            <ul>
              <li>Перезавантажити сторінку (F5 або Ctrl+R)</li>
              <li>Перевірити консоль браузера для деталей помилки</li>
              <li>Зв'язатися з адміністратором сайту</li>
            </ul>
            <a href="/" class="btn-base btn-primary">Повернутися на головну</a>
          </div>
        </div>
      `;
      return;
    }
    
    // Создаем алфавитный указатель
    const alphabet = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЮЯ".split('');
    const existingLetters = new Set(products.map(p => p["Опис матеріалу"].charAt(0).toUpperCase()));
    const alphabetHtml = `
      <div class="alphabet-index">
        <a href="#" class="alphabet-letter active-filter" data-letter="all">Всі</a>
        ${alphabet.map(letter => `
          <a href="#" class="alphabet-letter ${existingLetters.has(letter) ? '' : 'disabled'}" data-letter="${letter}">${letter}</a>
        `).join(' ')}
      </div>
    `;

    // Обновляем активный пункт меню
    document.querySelectorAll('.menu-item').forEach(item => {
      item.classList.remove('active');
      if (item.querySelector('a')?.getAttribute('href') === '/catalog') {
        item.classList.add('active');
      }
    });

    // Формируем HTML для таблицы продуктов
    let productsTableHtml = `
      <table class="products-table">
        <thead>
          <tr>
            <th>Назва препарату</th>
            <th>Ціна, грн</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Добавляем строки товаров и заголовки для букв
    let currentLetter = '';
    products.forEach(product => {
      const name = product["Опис матеріалу"];
      const price = product["Ціна"];
      const firstLetter = name.charAt(0).toUpperCase();
      
      // Добавляем заголовок для новой буквы
      if (firstLetter !== currentLetter) {
          currentLetter = firstLetter;
          productsTableHtml += `
              <tr class="letter-header" data-header-for="${currentLetter}">
                  <td colspan="3" id="letter-${currentLetter}">${currentLetter}</td>
              </tr>
          `;
      }
      
      // Define the instruction link URL - default to '#'
      const instructionUrl = '#';
      
      productsTableHtml += `
        <tr class="product-row" data-starts-with="${firstLetter}">
          <td class="product-name" data-label="">
            ${name}
            <div class="product-hover-info">
              <p class="manufacturer-info">Дарниця ПрАТ (Україна, Київ)</p>
              <p class="storage-info">Умови зберігання - спеціальних умов зберігання немає</p>
              <a href="${instructionUrl}" class="instruction-link" ${instructionUrl !== '#' ? 'target="_blank" rel="noopener noreferrer"' : ''}>Завантажити інструкцію</a>
            </div>
          </td>
          <td class="price-cell" data-label="Ціна:">${price.toFixed(2)}</td>
          <td data-label="">
            <button 
              class="btn-base btn-primary add-to-cart-icon-btn" 
              onclick="addToCartAndUpdate('${name.replace(/'/g, "\\'")}', 'ПрАТ Фармацевтична фірма Дарниця', ${price})" 
              aria-label="Додати до кошика">
              <svg class="cart-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="white" stroke="white" stroke-width="0.5"/>
              </svg>
            </button>
          </td>
        </tr>
      `;
    });
    
    productsTableHtml += `
        </tbody>
      </table>
    `;

    // Get cart count for displaying badges
    const cartItemsCount = getCartItemsCount();

    // Генерируем мобильное меню
    const mobileMenuHtml = `
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
                  <li class="menu-item active"><a href="/catalog">Каталог товарів</a></li>
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
    `;

    // Создаем полный HTML для страницы
    const finalHtml = `
      ${mobileMenuHtml}
      <div class="base">
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
            <nav class="main-sidebar">
              <ul class="main-menu">
                <li class="menu-item"><a href="/">Про нас</a></li>
                <li class="menu-item active"><a href="/catalog">Каталог товарів</a></li>
                <li class="menu-item"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу</a></li>
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
              <p>Телефон: <a href="tel:+380503010032">+380 (50) 301 00 32</a></p>
              <div class="footer-copyright">© ${new Date().getFullYear()}. ПРАТ «ФАРМАЦЕВТИЧНА ФІРМА „ДАРНИЦЯ"»</div>
            </div>
          </div>
          
          <div class="content-column">
            <div class="content__document">
              <nav class="breadcrumbs" aria-label="Навігаційні посилання">
                <ol class="breadcrumbs-list">
                  <li class="breadcrumbs-item">
                    <a href="/" class="breadcrumbs-link">Головна</a>
                  </li>
                  <li class="breadcrumbs-item">
                    <span class="breadcrumbs-current" aria-current="page">Каталог товарів</span>
                  </li>
                </ol>
              </nav>
              <h1>Каталог товарів</h1>
              <div class="otc-info-box">
                <p><strong>Увага:</strong> У каталозі представлені тільки безрецептурні лікарські засоби.</p>
              </div>
              <p>Нижче наведено каталог товарів, які наявні в продажу.</p>
              
              <div class="catalog-search-container">
                <div class="search-input-wrapper">
                  <input 
                    type="text" 
                    id="catalog-search" 
                    class="catalog-search-input" 
                    placeholder="Пошук товарів..."
                    aria-label="Пошук товарів в каталозі"
                  />
                  <span class="search-icon">🔍</span>
                  <button 
                    type="button" 
                    class="search-clear-btn" 
                    id="search-clear-btn"
                    aria-label="Очистити пошук"
                    style="display: none;"
                  >
                    ×
                  </button>
                </div>
                <div class="search-results-info" id="search-results-info" style="display: none;"></div>
              </div>
              
              ${alphabetHtml}

              <div class="catalog-table active-view">
                ${productsTableHtml}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    `;
    root.innerHTML = finalHtml;
    
    // Добавляем стили для отображения информации при наведении (сохраняем существующие стили)
    if (!document.getElementById('product-hover-styles')) {
      const style = document.createElement('style');
      style.id = 'product-hover-styles';
      style.textContent = `
        /* Keep styles specific to product hover */
        .product-name {
          position: relative;
        }
        .product-hover-info {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 10;
          background-color: white;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          padding: 10px;
          width: 280px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .product-name:hover .product-hover-info {
          display: block;
        }
        .manufacturer-info, .storage-info {
          margin: 5px 0;
          font-size: 14px;
        }
        .instruction-link {
          color: #009639;
          text-decoration: none;
          font-size: 14px;
          display: block;
          margin-top: 8px;
        }
        .instruction-link:hover {
          text-decoration: underline;
        }

        /* Alphabet index styles */
        .alphabet-index {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #eee;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .alphabet-letter {
          display: inline-block;
          padding: 5px 8px;
          margin: 2px;
          border: 1px solid #ccc;
          border-radius: 4px;
          text-decoration: none;
          color: #009639;
          font-weight: bold;
          transition: background-color 0.2s, color 0.2s;
        }
        .alphabet-letter:hover {
          background-color: #e8f5e9;
          color: #1b5e20;
        }
        .alphabet-letter.disabled {
          color: #ccc;
          pointer-events: none;
          border-color: #eee;
        }
        /* Style for letter headers in the table */
        .products-table .letter-header td {
          background-color: #f0f0f0; /* Light grey background */
          font-weight: bold;
          font-size: 1.1em;
          padding-top: 15px; /* Add some space above the letter */
          padding-bottom: 5px;
          border-top: 2px solid #ccc; /* Separator line */
          text-align: center; /* Центрируем текст заголовка буквы */
        }

        /* Enhanced table styles */
        .products-table {
          width: 100%;
          border-collapse: collapse; /* Remove double borders */
          margin-top: 20px; /* Add some space above the table */
          border: 1px solid #ccc; /* Add a subtle border around the table */
        }
        .products-table th, 
        .products-table td {
          border: 1px solid #ddd; /* Add borders to cells */
          padding: 12px; /* Increase padding for better readability */
          text-align: left; /* Align text to the left */
        }
        .products-table th {
          background-color: #e8f5e9; /* Light green background for header */
          color: #1b5e20; /* Darker green text color for header */
          font-weight: bold;
        }
        .products-table tbody tr:nth-child(even) {
          background-color: #f9f9f9; /* Slightly different background for even rows (zebra stripes) */
        }
        .products-table tbody tr:hover {
          background-color: #f1f8e9; /* Light green hover effect for rows */
        }
        .products-table .price-cell {
          text-align: right;
        }
        
        /* Cart badge styles */
        .desktop-cart-badge {
          display: flex;
          align-items: center;
          margin-top: 10px;
          text-decoration: none;
          color: #333;
          font-weight: bold;
        }
        .desktop-cart-badge.hidden {
          display: none;
        }
        .desktop-cart-badge .cart-icon {
          font-size: 18px;
          margin-right: 5px;
        }
        .desktop-cart-badge .cart-count {
          background-color: #f44336;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .desktop-cart-badge:hover {
          color: #4CAF50;
        }

        /* Style for add-to-cart icon button */
        .add-to-cart-icon-btn {
          padding: 8px 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          border-radius: 6px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .add-to-cart-icon-btn:hover {
          background-color: #007e2f;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .add-to-cart-icon-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .add-to-cart-icon-btn .cart-icon-svg {
          width: 22px;
          height: 22px;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
          transition: transform 0.2s ease;
        }
        
        .add-to-cart-icon-btn:hover .cart-icon-svg {
          transform: scale(1.1);
        }

        /* Row hiding class */
        .hidden-row {
            display: none;
        }
        
        .manufacturer-info, .storage-info {
          color: #1b5e20;
        }
        /* Style for the active filter letter */
        .alphabet-letter.active-filter {
            background-color: #009639; 
            color: white;
            border-color: #009639;
        }
        .alphabet-letter.active-filter:hover {
            background-color: #007a2e; /* Darker green on hover for active */
        }

        /* OTC Info Box styles */
        .otc-info-box {
          background-color: #e8f5e9;
          border: 2px solid #009639;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 20px;
          margin-top: 10px;
        }
        .otc-info-box p {
          margin: 0;
          color: #1b5e20;
          font-size: 15px;
          line-height: 1.5;
        }
        .otc-info-box strong {
          color: #009639;
          font-weight: 700;
        }

        /* Catalog search styles */
        .catalog-search-container {
          margin-bottom: 25px;
          margin-top: 20px;
        }

        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .catalog-search-input {
          width: 100%;
          padding: 12px 45px 12px 45px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .catalog-search-input:focus {
          outline: none;
          border-color: #009639;
          box-shadow: 0 0 0 3px rgba(0, 150, 57, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 15px;
          font-size: 18px;
          pointer-events: none;
          color: #666;
        }

        .search-clear-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          font-size: 24px;
          color: #666;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .search-clear-btn:hover {
          background-color: #f0f0f0;
          color: #333;
        }

        .search-results-info {
          margin-top: 10px;
          padding: 8px 12px;
          background-color: #e8f5e9;
          border-radius: 4px;
          color: #1b5e20;
          font-size: 14px;
        }

        .search-results-info.no-results {
          background-color: #ffebee;
          color: #c62828;
        }

        .product-row.search-highlight {
          background-color: #fff9c4;
          animation: highlight-pulse 0.5s ease;
        }

        @keyframes highlight-pulse {
          0% {
            background-color: #fff9c4;
          }
          50% {
            background-color: #fff59d;
          }
          100% {
            background-color: #fff9c4;
          }
        }

        /* Loading indicator styles */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          min-height: 300px;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e0e0e0;
          border-top-color: #009639;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          margin-top: 20px;
          color: #666;
          font-size: 16px;
        }

        /* Skeleton loader styles */
        .skeleton-loader {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          border-radius: 4px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .skeleton-row {
          height: 60px;
          margin-bottom: 10px;
        }

        @media (max-width: 768px) {
          .catalog-search-input {
            font-size: 16px; /* Предотвращаем zoom на iOS */
          }

          /* Преобразование таблицы в карточки на мобильных устройствах */
          .catalog-table {
            display: block;
          }

          .catalog-table table,
          .catalog-table thead,
          .catalog-table tbody,
          .catalog-table th,
          .catalog-table td,
          .catalog-table tr {
            display: block;
          }

          .catalog-table thead {
            display: none;
          }

          .catalog-table tr {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 15px;
            padding: 15px;
            background-color: #fff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          }

          .catalog-table tr.letter-header {
            background-color: #f5f5f5;
            border: none;
            border-radius: 6px;
            padding: 10px 15px;
            margin-bottom: 10px;
            text-align: center;
            font-weight: bold;
            font-size: 1.2em;
            box-shadow: none;
          }

          .catalog-table td {
            border: none;
            padding: 8px 0;
            text-align: left;
            position: relative;
            padding-left: 35%;
          }
          .catalog-table td.price-cell {
            text-align: right;
          }

          .catalog-table td:before {
            content: attr(data-label);
            position: absolute;
            left: 0;
            width: 30%;
            font-weight: 600;
            color: #666;
            font-size: 14px;
          }

          .catalog-table td.product-name {
            padding-left: 0;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 16px;
            color: #1b5e20;
          }

          .catalog-table td.product-name:before {
            display: none;
          }

          .catalog-table td:last-child {
            padding-left: 0;
            margin-top: 10px;
            text-align: right;
          }

          .catalog-table td:last-child:before {
            display: none;
          }

          .catalog-table .add-to-cart-icon-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    // Функция для настройки поиска в каталоге
    function setupCatalogSearch(productsList: ProductData[]): void {
      const searchInput = document.getElementById('catalog-search') as HTMLInputElement;
      const searchClearBtn = document.getElementById('search-clear-btn') as HTMLButtonElement;
      const searchResultsInfo = document.getElementById('search-results-info') as HTMLElement;
      const productRows = document.querySelectorAll<HTMLElement>('.product-row');
      const letterHeaders = document.querySelectorAll<HTMLElement>('.letter-header');
      const alphabetLinks = document.querySelectorAll('.alphabet-letter');

      if (!searchInput) return;

      // Функция для выполнения поиска
      const performSearch = (searchTerm: string): void => {
        const term = searchTerm.toLowerCase().trim();
        let visibleCount = 0;

        if (term === '') {
          // Показываем все товары
          productRows.forEach(row => {
            row.classList.remove('hidden-row');
            row.classList.remove('search-highlight');
          });
          letterHeaders.forEach(header => {
            header.classList.remove('hidden-row');
          });
          searchResultsInfo.style.display = 'none';
          searchClearBtn.style.display = 'none';
          return;
        }

        // Фильтруем товары
        productRows.forEach(row => {
          const productName = row.querySelector('.product-name')?.textContent?.toLowerCase() || '';
          const matches = productName.includes(term);
          
          if (matches) {
            row.classList.remove('hidden-row');
            row.classList.add('search-highlight');
            visibleCount++;
          } else {
            row.classList.add('hidden-row');
            row.classList.remove('search-highlight');
          }
        });

        // Показываем/скрываем заголовки букв в зависимости от видимости товаров
        letterHeaders.forEach(header => {
          const headerLetter = header.dataset.headerFor;
          const hasVisibleProducts = Array.from(productRows).some(row => {
            return row.dataset.startsWith === headerLetter && 
                   !row.classList.contains('hidden-row');
          });
          
          if (hasVisibleProducts) {
            header.classList.remove('hidden-row');
          } else {
            header.classList.add('hidden-row');
          }
        });

        // Обновляем информацию о результатах поиска
        if (visibleCount > 0) {
          searchResultsInfo.textContent = `Знайдено товарів: ${visibleCount}`;
          searchResultsInfo.style.display = 'block';
          searchResultsInfo.classList.remove('no-results');
        } else {
          searchResultsInfo.textContent = 'Товарів не знайдено';
          searchResultsInfo.style.display = 'block';
          searchResultsInfo.classList.add('no-results');
        }

        searchClearBtn.style.display = term ? 'block' : 'none';
      };

      // Обработчик ввода в поле поиска
      searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        performSearch(target.value);
      });

      // Обработчик кнопки очистки
      searchClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        performSearch('');
        searchInput.focus();
      });

      // Обработчик клавиши Escape
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          performSearch('');
        }
      });
    }

    // Функция для настройки фильтрации по алфавиту
    function setupAlphabetFilter(): void {
      const alphabetLinks = document.querySelectorAll('.alphabet-letter');
      const productRows = document.querySelectorAll<HTMLElement>('.product-row');
      const letterHeaders = document.querySelectorAll<HTMLElement>('.letter-header');

      alphabetLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          event.preventDefault(); // Отменяем стандартный переход по якорю

          // Убираем активный класс со всех ссылок
          alphabetLinks.forEach(l => l.classList.remove('active-filter'));
          // Добавляем активный класс к нажатой ссылке
          link.classList.add('active-filter');

          const selectedLetter = (link as HTMLElement).dataset.letter;

          productRows.forEach(row => {
            const startsWith = row.dataset.startsWith;
            // Показываем строку, если выбрано "all" или буква совпадает
            if (selectedLetter === 'all' || startsWith === selectedLetter) {
              row.classList.remove('hidden-row');
            } else {
              row.classList.add('hidden-row');
            }
          });

          letterHeaders.forEach(header => {
            const headerFor = header.dataset.headerFor;
            // Показываем заголовок, если выбрано "all" или буква совпадает
            if (selectedLetter === 'all' || headerFor === selectedLetter) {
              header.classList.remove('hidden-row');
            } else {
              header.classList.add('hidden-row');
            }
          });
        });
      });
    }

    // Функция для показа toast-уведомления
    function showToast(message: string, productName?: string): void {
      // Удаляем существующие toast, если есть
      const existingToast = document.querySelector('.toast-notification');
      if (existingToast) {
        existingToast.remove();
      }

      // Создаем новый toast
      const toast = document.createElement('div');
      toast.className = 'toast-notification';
      toast.setAttribute('role', 'alert');
      toast.setAttribute('aria-live', 'polite');
      
      const toastContent = productName 
        ? `
          <div class="toast-content">
            <div class="toast-icon">✓</div>
            <div class="toast-message">
              <strong>${message}</strong>
              <span class="toast-product-name">${productName}</span>
            </div>
          </div>
        `
        : `
          <div class="toast-content">
            <div class="toast-icon">✓</div>
            <div class="toast-message">
              <strong>${message}</strong>
            </div>
          </div>
        `;
      
      toast.innerHTML = toastContent;
      document.body.appendChild(toast);

      // Показываем toast с анимацией
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);

      // Автоматически скрываем через 3 секунды
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          toast.remove();
        }, 300);
      }, 3000);
    }

    // Добавляем функцию для добавления товара в корзину в глобальную область видимости
    window.addToCartAndUpdate = function(name: string, manufacturer: string, price: number): void {
      try {
        // Добавляем товар в корзину (с ID, так как это может быть нужно для orders.ts)
        addToCart({ 
          id: Date.now().toString(), 
          name, 
          manufacturer, 
          price
        }, 1);
        
        // Показываем toast-уведомление
        showToast('Товар додано до кошика', name);
        
        // Обновляем счетчик корзины
        updateCartCounter();
      } catch (error) {
        console.error('Помилка при додаванні товару:', error);
        showToast('Помилка при додаванні товару');
      }
    };
    
    // Настраиваем фильтр после отрисовки
    setupAlphabetFilter();
    
    // Настраиваем поиск
    setupCatalogSearch(products);
    
    // Setup page-specific event listeners
    setupPageAfterRender();
  } catch (error) {
    console.error('Error rendering catalog page:', error);
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div class="content">
          <div class="content__document">
            <h1>Помилка завантаження каталогу</h1>
            <p>Виникла помилка під час завантаження каталогу товарів. Будь ласка, спробуйте пізніше.</p>
            <a href="/" class="btn-base btn-primary">Повернутися на головну</a>
          </div>
        </div>
      `;
    }
  }
} 