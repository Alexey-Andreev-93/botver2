// handlers/hearsHandlers.ts
import { MenuService } from "../services/MenuService";
import { BotService } from "../services/BotService";
import { Logger } from "../utils/logger";

export const hearsHandlers = {
  menu: (ctx: any) => {
    const keyboard = MenuService.createMenuKeyboard();

    ctx.reply("🍽 *Меню нашего кафе:*", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
    Logger.debug(`Пользователь ${ctx.from?.id} открыл меню`);
  },

  cart: (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    BotService.showCart(ctx, userId);
  },

  contacts: (ctx: any) => {
    const contactText = `
📍 Наш адрес: Улица Пушкина, дом Колотушкина
🕒 Часы работы: 8:00 - 20:00 без выходных
📱 Телефон: +7 962 715 9858
🌐 Сайт: https://t.me/kofemedovik
    `;
    ctx.reply(contactText);
  },

  help: (ctx: any) => {
    const helpText = `
Я бот-помощник кафе "Медовик"!

Вот что я умею:
• Показывать меню с выбором блюд 🍽
• Принимать заказы с корзиной товаров 🛒
• Сообщать контакты и адрес 📞

Просто нажимайте на кнопки!
    `;
    ctx.reply(helpText);
  }
};