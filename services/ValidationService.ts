// services/ValidationService.ts

export class ValidationService {
  static isValidName(name: string): { isValid: boolean; message?: string } {
    if (!name || name.trim().length < 2) {
      return { isValid: false, message: 'Имя должно содержать минимум 2 символа' };
    }
    
    if (name.length > 50) {
      return { isValid: false, message: 'Имя слишком длинное (макс. 50 символов)' };
    }

    // Проверка на только буквы и пробелы
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/;
    if (!nameRegex.test(name)) {
      return { isValid: false, message: 'Имя может содержать только буквы, пробелы и дефисы' };
    }

    return { isValid: true };
  }

  static isValidPhone(phone: string): { isValid: boolean; message?: string } {
    if (!phone) {
      return { isValid: false, message: 'Телефон не может быть пустым' };
    }

    // Очищаем телефон от лишних символов
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Проверяем российские номера
    const phoneRegex = /^(\+7|7|8)?[489][0-9]{9}$/;
    
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, message: 'Введите корректный российский номер телефона' };
    }

    // Форматируем номер к стандартному виду
    const formattedPhone = cleanPhone.startsWith('7') || cleanPhone.startsWith('8') 
      ? `+7${cleanPhone.substring(1)}`
      : `+7${cleanPhone}`;

    return { isValid: true, message: formattedPhone };
  }

  static formatPhone(phone: string): string {
    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    if (cleanPhone.startsWith('7') || cleanPhone.startsWith('8')) {
      return `+7${cleanPhone.substring(1)}`;
    }
    
    return `+7${cleanPhone}`;
  }
}
