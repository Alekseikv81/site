import { replaceVerificationLinks } from './pharmacyVerificationButton';
import { getCartItemsCount } from './orders';
import { setupPageAfterRender } from './main';

// Функция отрисовки страницы "Умови продажу, оплаты та повернення"
export function renderConditionsPage(addAccessibilityControls?: () => void): void {
  const root = document.getElementById('root');
  if (!root) return;

  // Get cart count for displaying badges
  const cartItemsCount = getCartItemsCount();

  // Обновляем активный пункт меню
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
    if (item.querySelector('a')?.getAttribute('href') === '/umovy_prodazhu_ta_povernennya') {
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
                <li class="menu-item active"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу, оплати та повернення</a></li>
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
                <li class="menu-item"><a href="/">Про нас</a></li>
                <li class="menu-item"><a href="/catalog">Каталог товарів</a></li>
                <li class="menu-item active"><a href="/umovy_prodazhu_ta_povernennya">Умови продажу, оплати та повернення</a></li>
                <li class="menu-item"><a href="/delivery">Доставка</a></li>
                <li class="menu-item"><a href="/pharmacies">Наші аптеки</a></li>
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
                    <span class="breadcrumbs-current" aria-current="page">Умови продажу, оплати та повернення</span>
                  </li>
                </ol>
              </nav>
              <h1>Умови продажу, оплати та повернення</h1>
              
              <h2>Умови продажу:</h2>
              <p>Продаж товарів регулюється Публічним договором (офертою) купівлі-продажу товару, а також Законом України «Про електронну комерцію», Законом України «Про захист прав споживачів», Правилами продажу товарів на замовлення та поза торговельними або офісними приміщеннями та іншими законодавчими актами в частині, що не суперечить специфіці електронної комерції.</p>
              
              <h3><strong>Забороняється</strong> електронна роздрібна торгівля та доставка кінцевому споживачу:</h3>
              <ul>
                <li>лікарських засобів, реалізація (відпуск) яких громадянам здійснюється за рецептами лікарів (крім відпуску таких лікарських засобів за електронним рецептом у порядку, встановленому МОЗ);</li>
                <li>лікарських засобів, обіг яких відповідно до закону здійснюється за наявності ліцензії на провадження діяльності з обігу наркотичних засобів, психотропних речовин і прекурсорів;</li>
                <li>сильнодіючих, отруйних, радіоактивних лікарських засобів та медичних імунобіологічних препаратів, перелік яких визначається МОЗ.</li>
              </ul>
              
              <h2>Способи оплати:</h2>
              <p>В аптеках та під час доставки кур'єром, Ви маєте можливість здійснити оплату замовлення готівкою або банківською карткою при отриманні.</p>
              
              <h2>Умови повернення товару:</h2>
              <p>Постановою Кабінету Міністрів України «Про реалізацію окремих положень Закону України« Про захист прав споживачів »від 19 березня 1994 № 172 затверджено перелік товарів належної якості, що не підлягають обміну (поверненню), якщо вони не задовольняють споживачів з будь-яких причин. <a href="https://zakon.rada.gov.ua/laws/show/172-94-%D0%BF#Text" target="_blank">https://zakon.rada.gov.ua/laws/show/172-94-%D0%BF#Text</a></p>
              
              <p>У вищевказаний перелік, крім деяких інших, включені наступні групи товарів, які можуть реалізовуватися аптечними установами:</p>
              <ul>
                <li>лікарські препарати і засоби;</li>
                <li>предмети санітарії та гігієни;</li>
                <li>світлочутливі товари (наприклад, рентгенівська плівка);</li>
                <li>корсетні товари;</li>
                <li>парфюмерно-косметичні вироби;</li>
                <li>товари в аерозольній упаковці.</li>
              </ul>
              
              <p>Отже, ці товари, якщо вони належної якості, поверненню і обміну не підлягають.</p>
              
              <h3><strong>Лікарські засоби</strong> можуть бути повернуті в аптечний заклад покупцем виключно за умови надання ним оригіналу розрахункового документу на придбання лікарських засобів та документу, що підтверджує факт неналежної якості лікарського засобу.</h3>
              
              <p>Документи, що підтверджують факт неналежної якості лікарського засобу:</p>
              <ol>
                <li>висновок щодо якості лікарських засобів, виданий підпорядкованою лабораторією територіального органу Держлікслужби та/або уповноваженою лабораторією;</li>
                <li>розпорядження Держлікслужби щодо заборони обігу лікарського засобу.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Проверяем передан ли callback и вызываем его
  if (typeof addAccessibilityControls === 'function') {
    addAccessibilityControls();
  }
  
  // Setup page-specific event listeners
  setupPageAfterRender();
} 