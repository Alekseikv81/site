// Модуль для работы с заказами и корзиной
import { replaceVerificationLinks } from './pharmacyVerificationButton';
import { setupPageAfterRender } from './main';

// Интерфейс продукта в корзине
export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  quantity: number;
}

// Интерфейс корзины
export interface Cart {
  items: Product[];
  totalPrice: number;
}

// Получение корзины из localStorage
export function getCart(): Cart {
  try {
    const cartData = localStorage.getItem('pharmacy-cart');
    if (!cartData) {
      return { items: [], totalPrice: 0 };
    }
    
    const cart = JSON.parse(cartData);
    // Пересчитываем общую стоимость для безопасности
    cart.totalPrice = calculateTotalPrice(cart.items);
    return cart;
  } catch (error) {
    console.error('Ошибка при получении корзины:', error);
    return { items: [], totalPrice: 0 };
  }
}

// Сохранение корзины в localStorage
export function saveCart(cart: Cart): void {
  localStorage.setItem('pharmacy-cart', JSON.stringify(cart));
}

// Добавление товара в корзину
export function addToCart(product: Omit<Product, 'quantity'>, quantity = 1): void {
  const cart = getCart();
  const existingItemIndex = cart.items.findIndex(item => item.id === product.id);
  
  if (existingItemIndex > -1) {
    // Если товар уже есть в корзине, увеличиваем количество
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    // Добавляем новый товар
    cart.items.push({
      ...product,
      quantity
    });
  }
  
  cart.totalPrice = calculateTotalPrice(cart.items);
  saveCart(cart);
}

// Удаление товара из корзины
export function removeFromCart(productId: string): void {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.id !== productId);
  cart.totalPrice = calculateTotalPrice(cart.items);
  saveCart(cart);
}

// Обновление количества товара
export function updateProductQuantity(productId: string, quantity: number): void {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const cart = getCart();
  const item = cart.items.find(item => item.id === productId);
  
  if (item) {
    item.quantity = quantity;
    cart.totalPrice = calculateTotalPrice(cart.items);
    saveCart(cart);
  }
}

// Очистка корзины
export function clearCart(): void {
  const emptyCart: Cart = { items: [], totalPrice: 0 };
  saveCart(emptyCart);
}

// Расчет общей стоимости
function calculateTotalPrice(items: Product[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Получение количества товаров в корзине
export function getCartItemsCount(): number {
  const cart = getCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

// Интерфейс данных заказа
interface OrderData {
  customerName: string;
  phoneNumber: string;
  deliveryMethod: string;
  pharmacy: string;
  cart: Cart;
  date: Date;
}

// Функция для отрисовки страницы заказов
export function renderOrdersPage(): void {
  const root = document.getElementById('root');
  if (!root) return;
  
  // Получаем корзину
  const cart = getCart();
  
  // Получаем количество товаров в корзине для отображения счетчика
  const cartItemsCount = getCartItemsCount();
  
  // Обновляем активный пункт меню
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.querySelector('a')?.getAttribute('href') === '/orders') {
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
                  <a href="/orders" class="cart-link mobile-cart-badge ${cartItemsCount === 0 ? 'hidden' : ''}">
                    <div class="cart-icon">🛒</div>
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
                <li class="menu-item"><a href="/delivery">Доставка</a></li>
                <li class="menu-item"><a href="/pharmacies">Наші аптеки</a></li>
                <li class="menu-item"><a href="/public_offer">Умови публічної оферти</a></li>
                <li class="menu-item"><a href="/privacy_policy">Політика конфіденційності</a></li>
                <li class="menu-item"><a href="/consent_personal_data">Згода на обробку персональних даних</a></li>
                <li class="menu-item"><a href="https://www.dls.gov.ua/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80-%D1%81%D1%83%D0%B1%D1%94%D0%BA%D1%82%D1%96%D0%B2-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D1%8F%D0%BA%D1%96/" target="_blank" class="verify-link">Перевір легальність роботи аптеки</a></li>
                <li class="menu-item"><button class="accessibility-button static-accessibility-button j-dashboard-show"><span class="accessibility-icon">👓</span> Людям з порушенням зору</button></li>
                <li class="menu-item">
                  <a href="/orders" class="cart-link sidebar-cart-badge ${cartItemsCount === 0 ? 'hidden' : ''}">
                    <div class="cart-icon">🛒</div>
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
                    <span class="breadcrumbs-current" aria-current="page">Кошик</span>
                  </li>
                </ol>
              </nav>
              <h1>Кошик</h1>
              
              ${cart.items.length === 0 ? `
                <div class="empty-cart">
                  <p>Ваш кошик порожній</p>
                  <a href="/catalog" class="back-to-catalog-btn">Перейти до каталогу</a>
                </div>
              ` : `
                <div class="cart-container">
                  <div class="cart-items">
                    ${cart.items.map(item => `
                      <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-info">
                          <h3>${item.name}</h3>
                          <p class="cart-item-manufacturer">${item.manufacturer}</p>
                          <p class="cart-item-price">₴${item.price.toFixed(2)}</p>
                        </div>
                        <div class="cart-item-quantity">
                          <button class="quantity-btn minus" data-id="${item.id}">-</button>
                          <input type="number" min="1" value="${item.quantity}" class="quantity-input" data-id="${item.id}">
                          <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <div class="cart-item-total">
                          <p>₴${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div class="cart-item-remove">
                          <button class="remove-btn" data-id="${item.id}">×</button>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                  
                  <div class="cart-summary">
                    <div class="cart-total">
                      <p>Загальна сума:</p>
                      <p class="total-price">₴${cart.totalPrice.toFixed(2)}</p>
                    </div>
                    <button class="clear-cart-btn">Очистити кошик</button>
                  </div>
                  
                  <form class="checkout-form" id="checkout-form">
                    <h2>Оформлення замовлення</h2>
                    
                    <div class="form-field">
                      <input 
                        type="text" 
                        placeholder="ПІБ замовника *" 
                        required 
                        name="customerName" 
                        id="customerName"
                        aria-describedby="customerName-error"
                      >
                      <span class="error-message" id="customerName-error" role="alert"></span>
                    </div>
                    <div class="form-field">
                      <input 
                        type="tel" 
                        placeholder="0XX-XXX-XX-XX" 
                        required 
                        name="phoneNumber" 
                        id="phoneNumber" 
                        pattern="[0-9]{3}-[0-9]{3}-[0-9]{2}-[0-9]{2}"
                        title="Будь ласка, введіть номер у форматі 0XX-XXX-XX-XX"
                        aria-describedby="phoneNumber-error"
                      >
                      <span class="error-message" id="phoneNumber-error" role="alert"></span>
                    </div>
                    <div class="form-field checkbox-field">
                      <input type="checkbox" id="terms" required>
                      <label for="terms">Підтверджуючи замовлення, я приймаю <a href="/public_offer">Умови публічної оферти</a> та даю згоду на обробку моїх персональних даних.</label>
                    </div>
                    <div class="form-field">
                      <select required name="deliveryMethod" id="deliveryMethod" aria-describedby="deliveryMethod-error">
                        <option value="">Спосіб отримання *</option>
                        <option value="Самовивіз з аптеки">Самовивіз з аптеки</option>
                      </select>
                      <span class="error-message" id="deliveryMethod-error" role="alert"></span>
                    </div>
                    <div class="form-field">
                      <select required name="pharmacy" id="pharmacy" aria-describedby="pharmacy-error">
                        <option value="">Аптека *</option>
                        <option value="м. Київ, вул. Новодарницька, 6">м. Київ, вул. Новодарницька, 6</option>
                      </select>
                      <span class="error-message" id="pharmacy-error" role="alert"></span>
                    </div>
                    <div class="order-status" id="order-status"></div>
                    <div class="form-buttons">
                      <button type="button" class="btn-base btn-large btn-secondary back-to-catalog-btn">Назад до каталогу</button>
                      <button type="submit" class="btn-base btn-large btn-primary">Підтвердити замовлення</button>
                    </div>
                  </form>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Добавляем стили для корзины
  const cartStyles = `
    .cart-link {
      position: relative;
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      color: #333;
      transition: all 0.3s ease;
    }
    
    .cart-icon {
      font-size: 2em;
      color: #009639;
      margin-right: 5px;
      filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1));
      transition: transform 0.2s ease;
    }
    
    .cart-link:hover .cart-icon {
      transform: translateY(-2px);
    }
    
    .cart-count {
      position: absolute;
      top: 0;
      right: 0;
      transform: translate(30%, -30%);
      background-color: #ff5252;
      color: white;
      font-size: 12px;
      min-width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 3px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 1;
    }
    
    .mobile-cart-badge {
      position: relative;
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background: linear-gradient(to right, #009639, #00b347);
      border-radius: 20px;
      color: white;
      font-weight: 500;
      box-shadow: 0 2px 6px rgba(0, 150, 57, 0.2);
    }
    
    .mobile-cart-badge .cart-icon {
      width: auto;
      height: auto;
      font-size: 2em;
      color: white;
      filter: none;
      margin-right: 8px;
    }
    
    .mobile-cart-badge .cart-count {
      position: absolute;
      top: -2px;
      right: -2px;
      transform: translate(30%, -30%);
      background-color: white;
      color: #009639;
      font-size: 11px;
      min-width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 1px solid #009639;
    }
    
    .sidebar-cart-badge {
      position: relative;
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: linear-gradient(to right, #009639, #00b347);
      border-radius: 8px;
      margin-top: 12px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 150, 57, 0.2);
      color: white;
      font-weight: 500;
    }
    
    .sidebar-cart-badge:hover {
      background: linear-gradient(to right, #00b347, #00cc52);
      box-shadow: 0 4px 12px rgba(0, 150, 57, 0.3);
      transform: translateY(-2px);
    }
    
    .sidebar-cart-badge .cart-icon {
      width: auto;
      height: auto;
      font-size: 2.2em;
      color: white;
      filter: none;
    }
    
    .sidebar-cart-badge .cart-count {
      position: absolute;
      top: 5px;
      right: 10px;
      transform: translate(30%, -30%);
      margin-left: 0;
      background-color: white;
      color: #009639;
      font-weight: bold;
      min-width: 24px;
      height: 24px;
    }
    
    .hidden {
      display: none;
    }
    
    .empty-cart {
      text-align: center;
      padding: 40px 20px;
    }
    
    .empty-cart p {
      color: #666;
      margin-bottom: 20px;
      font-size: 18px;
    }
    
    .back-to-catalog-btn {
      background-color: #009639;
      color: #ffffff !important;
      padding: 12px 24px;
      border-radius: 4px;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.3s ease;
      font-weight: 700;
    }
    
    .back-to-catalog-btn:hover {
      background-color: #007a2e;
    }
    
    .cart-container {
      max-width: 800px;
    }
    
    .cart-items {
      margin-bottom: 30px;
    }
    
    .cart-item {
      display: grid;
      grid-template-columns: 2fr 150px 100px 40px;
      gap: 20px;
      align-items: center;
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 15px;
      background-color: #fff;
    }
    
    .cart-item-info h3 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 16px;
    }
    
    .cart-item-manufacturer {
      margin: 0 0 5px 0;
      color: #666;
      font-size: 14px;
    }
    
    .cart-item-price {
      margin: 0;
      color: #009639;
      font-weight: bold;
      font-size: 16px;
    }
    
    .cart-item-quantity {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .quantity-btn {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    
    .quantity-btn:hover {
      background-color: #f5f5f5;
    }
    
    .quantity-input {
      width: 60px;
      height: 30px;
      text-align: center;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .cart-item-total p {
      margin: 0;
      color: #009639;
      font-weight: bold;
      font-size: 16px;
    }
    
    .remove-btn {
      width: 30px;
      height: 30px;
      border: none;
      background-color: #ff5252;
      color: white;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
    }
    
    .remove-btn:hover {
      background-color: #e53935;
    }
    
    .cart-summary {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #f9f9f9;
      margin-bottom: 30px;
    }
    
    .cart-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .cart-total p {
      margin: 0;
      font-size: 18px;
      font-weight: bold;
    }
    
    .total-price {
      color: #009639;
    }
    
    .clear-cart-btn {
      background-color: #ff5252;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .clear-cart-btn:hover {
      background-color: #e53935;
    }
    
    .checkout-form {
      padding: 30px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fff;
    }
    
    .checkout-form h2 {
      margin: 0 0 25px 0;
      color: #333;
    }
    
    .form-field {
      margin-bottom: 20px;
    }
    
    .form-field input,
    .form-field select {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
      transition: border-color 0.3s ease;
    }

    .form-field input.error,
    .form-field select.error {
      border-color: #f44336;
      box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.1);
    }

    .form-field input:focus,
    .form-field select:focus {
      outline: none;
      border-color: #009639;
      box-shadow: 0 0 0 2px rgba(0, 150, 57, 0.1);
    }

    .error-message {
      display: block;
      color: #f44336;
      font-size: 12px;
      margin-top: 5px;
      min-height: 18px;
    }
    
    .checkbox-field {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    
    .checkbox-field input[type="checkbox"] {
      width: auto;
      margin: 4px 0 0 0;
    }
    
    .checkbox-field label {
      font-size: 14px;
      line-height: 1.4;
      color: #666;
    }
    
    .checkbox-field label a {
      color: #009639;
      text-decoration: none;
    }
    
    .checkbox-field label a:hover {
      text-decoration: underline;
    }
    
    .form-buttons {
      display: flex;
      gap: 15px;
      justify-content: space-between;
      margin-top: 30px;
    }
    
    .btn-base {
      padding: 15px 30px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .btn-primary {
      background-color: #009639;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #007a2e;
    }
    
    .btn-secondary {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    }
    
    .btn-secondary:hover {
      background-color: #e0e0e0;
    }
    
    .order-status {
      margin: 20px 0;
      padding: 15px;
      border-radius: 4px;
      display: none;
    }
    
    .order-status.success {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      display: block;
    }
    
    .order-status.error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      display: block;
    }
  `;
  
  // Добавляем стили в head
  if (!document.getElementById('cart-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-styles';
    style.textContent = cartStyles;
    document.head.appendChild(style);
  }
  
  // Добавляем обработчики событий после рендеринга
  setTimeout(() => {
    setupCartEventListeners();
  }, 100);
  
  // Setup page-specific event listeners
  setupPageAfterRender();
}

// Функция для настройки обработчиков событий корзины
function setupCartEventListeners(): void {
  // Обработчики для кнопок изменения количества
  document.querySelectorAll('.quantity-btn').forEach(button => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = button.cloneNode(true);
    if (button.parentNode) {
      button.parentNode.replaceChild(clone, button);
    }
    
    clone.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const productId = target.dataset.id;
      const isPlus = target.classList.contains('plus');
      
      if (!productId) return;
      
      const quantityInput = document.querySelector(`.quantity-input[data-id="${productId}"]`) as HTMLInputElement;
      if (!quantityInput) return;
      
      let newQuantity = parseInt(quantityInput.value);
      if (isPlus) {
        newQuantity++;
      } else {
        newQuantity = Math.max(1, newQuantity - 1);
      }
      
      quantityInput.value = newQuantity.toString();
      updateProductQuantity(productId, newQuantity);
      updateCartUI();
    });
  });
  
  // Обработчики для полей ввода количества
  document.querySelectorAll('.quantity-input').forEach(input => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = input.cloneNode(true) as HTMLInputElement;
    if (input.parentNode) {
      input.parentNode.replaceChild(clone, input);
    }
    
    clone.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      const productId = target.dataset.id;
      const newQuantity = Math.max(1, parseInt(target.value) || 1);
      
      if (!productId) return;
      
      target.value = newQuantity.toString();
      updateProductQuantity(productId, newQuantity);
      updateCartUI();
    });
  });
  
  // Обработчики для кнопок удаления
  document.querySelectorAll('.remove-btn').forEach(button => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = button.cloneNode(true);
    if (button.parentNode) {
      button.parentNode.replaceChild(clone, button);
    }
    
    clone.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const productId = target.dataset.id;
      
      if (!productId) return;
      
      removeFromCart(productId);
      updateCartUI();
    });
  });
  
  // Обработчик для кнопки очистки корзины
  const clearCartBtn = document.querySelector('.clear-cart-btn');
  if (clearCartBtn) {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = clearCartBtn.cloneNode(true);
    if (clearCartBtn.parentNode) {
      clearCartBtn.parentNode.replaceChild(clone, clearCartBtn);
    }
    
    clone.addEventListener('click', () => {
      if (confirm('Ви впевнені, що хочете очистити кошик?')) {
        clearCart();
        updateCartUI();
      }
    });
  }
  
  // Обработчик формы оформления заказа
  const checkoutForm = document.getElementById('checkout-form') as HTMLFormElement;
  if (checkoutForm) {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = checkoutForm.cloneNode(true) as HTMLFormElement;
    if (checkoutForm.parentNode) {
      checkoutForm.parentNode.replaceChild(clone, checkoutForm);
    }
    
    clone.addEventListener('submit', handleOrderSubmit);
    
    // Настраиваем валидацию в реальном времени
    setupFormValidation(clone);
  }
  
  // Обработчик кнопки "Назад до каталогу"
  document.querySelectorAll('.back-to-catalog-btn').forEach(btn => {
    // Удаляем старые обработчики, чтобы избежать дублирования
    const clone = btn.cloneNode(true);
    if (btn.parentNode) {
      btn.parentNode.replaceChild(clone, btn);
    }
    
    clone.addEventListener('click', (e) => {
      e.preventDefault();
      window.history.back();
    });
  });
}

// Функция для настройки валидации формы
function setupFormValidation(form: HTMLFormElement): void {
  const customerNameInput = form.querySelector('#customerName') as HTMLInputElement;
  const phoneNumberInput = form.querySelector('#phoneNumber') as HTMLInputElement;
  const deliveryMethodSelect = form.querySelector('#deliveryMethod') as HTMLSelectElement;
  const pharmacySelect = form.querySelector('#pharmacy') as HTMLSelectElement;
  const termsCheckbox = form.querySelector('#terms') as HTMLInputElement;

  // Функция для показа ошибки
  const showError = (field: HTMLElement, errorId: string, message: string): void => {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = message;
      field.classList.add('error');
    }
  };

  // Функция для скрытия ошибки
  const hideError = (field: HTMLElement, errorId: string): void => {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
      errorElement.textContent = '';
      field.classList.remove('error');
    }
  };

  // Валидация имени
  if (customerNameInput) {
    customerNameInput.addEventListener('blur', () => {
      const value = customerNameInput.value.trim();
      if (!value) {
        showError(customerNameInput, 'customerName-error', 'Будь ласка, введіть ПІБ замовника');
      } else if (value.length < 2) {
        showError(customerNameInput, 'customerName-error', 'ПІБ повинно містити мінімум 2 символи');
      } else {
        hideError(customerNameInput, 'customerName-error');
      }
    });

    customerNameInput.addEventListener('input', () => {
      if (customerNameInput.value.trim().length >= 2) {
        hideError(customerNameInput, 'customerName-error');
      }
    });
  }

  // Маска для телефона и валидация
  if (phoneNumberInput) {
    phoneNumberInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      let value = target.value.replace(/\D/g, ''); // Удаляем все нецифровые символы
      
      if (value.length > 0) {
        if (value.length <= 3) {
          // Keep value as is
        } else if (value.length <= 6) {
          value = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 8) {
          value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
        } else {
          value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 8) + '-' + value.slice(8, 10);
        }
        target.value = value;
      }
    });

    phoneNumberInput.addEventListener('blur', () => {
      const value = phoneNumberInput.value.trim();
      const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{2}-[0-9]{2}$/;
      if (!value) {
        showError(phoneNumberInput, 'phoneNumber-error', 'Будь ласка, введіть номер телефону');
      } else if (!phonePattern.test(value)) {
        showError(phoneNumberInput, 'phoneNumber-error', 'Введіть номер у форматі 0XX-XXX-XX-XX');
      } else {
        hideError(phoneNumberInput, 'phoneNumber-error');
      }
    });

    phoneNumberInput.addEventListener('input', () => {
      const phonePattern = /^[0-9]{3}-[0-9]{3}-[0-9]{2}-[0-9]{2}$/;
      if (phonePattern.test(phoneNumberInput.value)) {
        hideError(phoneNumberInput, 'phoneNumber-error');
      }
    });
  }

  // Валидация способа получения
  if (deliveryMethodSelect) {
    deliveryMethodSelect.addEventListener('change', () => {
      if (!deliveryMethodSelect.value) {
        showError(deliveryMethodSelect, 'deliveryMethod-error', 'Будь ласка, оберіть спосіб отримання');
      } else {
        hideError(deliveryMethodSelect, 'deliveryMethod-error');
      }
    });
  }

  // Валидация аптеки
  if (pharmacySelect) {
    pharmacySelect.addEventListener('change', () => {
      if (!pharmacySelect.value) {
        showError(pharmacySelect, 'pharmacy-error', 'Будь ласка, оберіть аптеку');
      } else {
        hideError(pharmacySelect, 'pharmacy-error');
      }
    });
  }
}

// Функция обработки отправки заказа
function handleOrderSubmit(e: Event): void {
  e.preventDefault();
  
  const form = e.target as HTMLFormElement;
  const formData = new FormData(form);
  const cart = getCart();
  
  if (cart.items.length === 0) {
    showOrderStatus('Кошик порожній', 'error');
    return;
  }
  
  const orderData: OrderData = {
    customerName: formData.get('customerName') as string,
    phoneNumber: formData.get('phoneNumber') as string,
    deliveryMethod: formData.get('deliveryMethod') as string,
    pharmacy: formData.get('pharmacy') as string,
    cart: cart,
    date: new Date()
  };
  
  // Показываем успешное сообщение
  showOrderStatus('Дякуємо за замовлення! Наш менеджер зв\'яжеться з вами найближчим часом для підтвердження.', 'success');
  
  // Очищаем корзину
  clearCart();
  
  // Обновляем UI
  setTimeout(() => {
    renderOrdersPage();
  }, 3000);
}

// Функция для отображения статуса заказа
function showOrderStatus(message: string, type: 'success' | 'error'): void {
  const statusElement = document.getElementById('order-status');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `order-status ${type}`;
  }
}

// Функция для обновления UI корзины
function updateCartUI(): void {
  renderOrdersPage();
}

// Функция для обновления счетчика корзины
export function updateCartCounter(): void {
  const cartItemsCount = getCartItemsCount();
  const cartCountElements = document.querySelectorAll('.cart-count');
  const cartBadges = document.querySelectorAll('.cart-link');
  
  cartCountElements.forEach(element => {
    element.textContent = cartItemsCount.toString();
  });
  
  cartBadges.forEach(badge => {
    if (cartItemsCount === 0) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }
  });
} 