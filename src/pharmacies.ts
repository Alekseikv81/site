import { replaceVerificationLinks } from './pharmacyVerificationButton';
import { getCartItemsCount } from './orders';
import { setupPageAfterRender } from './main';

// Функция отрисовки страницы "Наші аптеки"
export function renderPharmaciesPage(): void {
  const root = document.getElementById('root');
  if (!root) return;

  // Get cart count for displaying badges
  const cartItemsCount = getCartItemsCount();

  // Обновляем активный пункт меню
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.querySelector('a')?.getAttribute('href') === '/pharmacies') {
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
                <li class="menu-item active"><a href="/pharmacies">Наші аптеки</a></li>
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
                <li class="menu-item"><a href="/delivery">Доставка</a></li>
                <li class="menu-item active"><a href="/pharmacies">Наші аптеки</a></li>
                <li class="menu-item"><a href="/public_offer">Умови публічної оферти</a></li>
                <li class="menu-item"><a href="/privacy_policy">Політика конфіденційності</a></li>
                <li class="menu-item"><a href="/consent_personal_data">Згода на обробку персональних даних</a></li>
                <li class="menu-item"><a href="https://www.dls.gov.ua/%D1%80%D0%B5%D1%94%D1%81%D1%82%D1%80-%D1%81%D1%83%D0%B1%D1%94%D0%BA%D1%82%D1%96%D0%B2-%D0%B3%D0%BE%D1%81%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D1%8E%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F-%D1%8F%D0%BA%D1%96/" target="_blank" class="verify-link">Перевір легальність роботи аптеки</a></li>
                <li class="menu-item"><button class="accessibility-button j-dashboard-show"><span class="accessibility-icon">👓</span> Людям з порушенням зору</button></li>
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
              <nav class="breadcrumbs" aria-label="Навігаційні посилання">
                <ol class="breadcrumbs-list">
                  <li class="breadcrumbs-item">
                    <a href="/" class="breadcrumbs-link">Головна</a>
                  </li>
                  <li class="breadcrumbs-item">
                    <span class="breadcrumbs-current" aria-current="page">Наші аптеки</span>
                  </li>
                </ol>
              </nav>
              <h1>Наші аптеки</h1>
              
              <div class="pharmacy-list">
                <div class="pharmacy-item">
                  <h3>Фірмова аптека "Дарниця"</h3>
                  <div class="pharmacy-info">
                    <div class="pharmacy-address">
                      <h4>Адреса</h4>
                      <p>вул. Новодарницька 6, м. Київ</p>
                    </div>
                    <div class="pharmacy-schedule">
                      <h4>Режим роботи</h4>
                      <p>Пн-Нд: 09:00-20:00</p>
                    </div>
                    <div class="pharmacy-contact">
                      <h4>Телефон фахівця для отримання консультації</h4>
                      <p>+380 (50) 301 00 32</p>
                    </div>
                    <div class="pharmacy-email">
                      <h4>Електронна пошта</h4>
                      <p>info@liki.darnytsia.ua</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="pharmacy-map">
                <h2>Знайти аптеку на карті</h2>
                <div class="map-container">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2541.858897726773!2d30.634878276591225!3d50.42477869076754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40d4c57dd83a31a5%3A0xa6efb79b7153324e!2z0J3QvtCy0L7QtNCw0YDQvdC40YbRjNC60LAsIDYsINCa0LjRl9Cy!5e0!3m2!1suk!2sua!4v1624888780151!5m2!1suk!2sua" 
                    allowfullscreen="" 
                    loading="lazy"
                    title="Карта розташування аптеки Дарниця" 
                    aria-label="Карта розташування аптеки Дарниця">
                  </iframe>
                </div>
                <p class="map-instruction">Натисніть на карту, щоб взаємодіяти з нею. Ви можете збільшувати та зменшувати масштаб за допомогою колеса миші.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Setup page-specific event listeners
  setupPageAfterRender();
} 