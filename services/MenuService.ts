// services/MenuService.ts
import { MENU_ITEMS } from "../config/constants";

// Интерфейс для элемента меню
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  weight?: string;
  unit?: string;
}

export class MenuService {
  static getMenuByCategory(category: string): MenuItem[] {
    return MENU_ITEMS.filter(item => item.category === category);
  }

  static getMenuItem(id: number): MenuItem | undefined {
    return MENU_ITEMS.find(item => item.id === id);
  }

  static getAllCategories(): string[] {
    return Array.from(new Set(MENU_ITEMS.map(item => item.category)));
  }

  static getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      'medoviki': '🍰 МЕДОВИКИ 🍯',
      'cakes': '🎂 ТОРТЫ И ПИРОЖНЫЕ',
      'lunch': '🍽 КОМПЛЕКСНЫЕ ОБЕДЫ'
    };
    return names[category] || category;
  }

  static formatMenuItem(item: MenuItem): string {
    const weight = item.weight ? ` (${item.weight})` : '';
    return `${item.emoji} ${item.name}${weight} - ${item.price}₽`;
  }

  static createMenuKeyboard() {
    const keyboard = [];
    
    // Группируем товары по категориям
    const categories: { [key: string]: MenuItem[] } = {};
    MENU_ITEMS.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    // Добавляем заголовок медовиков (просто текст)
    keyboard.push([{ text: this.getCategoryName('medoviki'), callback_data: "ignore" }]);
    
    // Добавляем медовики по одному в ряд
    categories.medoviki.forEach(item => {
      const weight = item.weight ? ` (${item.weight})` : '';
      keyboard.push([{ 
        text: `${item.emoji} ${item.name}${weight} - ${item.price}₽`, 
        callback_data: `add_${item.id}` 
      }]);
    });

    // Добавляем заголовок тортов (просто текст)
    keyboard.push([{ text: this.getCategoryName('cakes'), callback_data: "ignore" }]);
    
    // Добавляем торты по одному в ряд
    categories.cakes.forEach(item => {
      const weight = item.weight ? ` (${item.weight})` : '';
      keyboard.push([{ 
        text: `${item.emoji} ${item.name}${weight} - ${item.price}₽`, 
        callback_data: `add_${item.id}` 
      }]);
    });

    // Добавляем заголовок обедов (просто текст)
    keyboard.push([{ text: this.getCategoryName('lunch'), callback_data: "ignore" }]);
    
    // Добавляем обеды по одному в ряд
    categories.lunch.forEach(item => {
      keyboard.push([{ 
        text: `${item.emoji} ${item.name} - ${item.price}₽`, 
        callback_data: `add_${item.id}` 
      }]);
    });
    
    // Добавляем только кнопку корзины
    keyboard.push([{ text: "🛒 Перейти в корзину", callback_data: "view_cart" }]);

    return keyboard;
  }
}