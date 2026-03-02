import { replaceVerificationLinks } from './pharmacyVerificationButton';
import { getCartItemsCount } from './orders'; // Import getCartItemsCount

// Функция отрисовки страницы "Політика конфіденційності"
export function renderPrivacyPolicyPage(): void {
  // Перенаправляем пользователя прямо на PDF файл
  window.location.href = '/src/files/Privacy_Policy.pdf';
} 