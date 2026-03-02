// Функция отрисовки страницы "Згода на обробку персональних даних"
export function renderConsentPersonalDataPage(): void {
  // Перенаправляем пользователя прямо на PDF файл
  window.location.href = '/src/files/Consent_personal_data.pdf';
} 