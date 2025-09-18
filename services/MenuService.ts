// services/MenuService.ts
import { MENU_ITEMS } from "../config/constants";

export class MenuService {
  static getMenuByCategory(category: string) {
    return MENU_ITEMS.filter(item => item.category === category);
  }

  static getMenuItem(id: number) {
    return MENU_ITEMS.find(item => item.id === id);
  }

  static getAllCategories() {
    return Array.from(new Set(MENU_ITEMS.map(item => item.category)));
  }

  static getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      'medoviki': '🍰 Медовики',
      'cakes': '🎂 Торты и пирожные',
      'lunch': '🍽 Комплексные обеды'
    };
    return names[category] || category;
  }

  static formatMenu() {
    let menuText = '';
    const categories = this.getAllCategories();

    categories.forEach(category => {
      menuText += `\n${this.getCategoryName(category)}\n\n`;
      
      const items = this.getMenuByCategory(category);
      items.forEach(item => {
        const unit = item.unit ? `/${item.unit}` : '';
        menuText += `${item.emoji} ${item.name} - ${item.price}₽${unit}\n`;
      });
    });

    menuText += '\nЧтобы добавить в корзину, нажмите на кнопку с товаром 👇';
    return menuText;
  }
}