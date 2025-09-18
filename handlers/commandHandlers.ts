// handlers/commandHandlers.ts
import { BotService } from "../services/BotService";
import { Logger } from "../utils/logger";

export const commandHandlers = {
  start: (ctx: any) => {
    const menuKeyboard = {
      keyboard: [
        ["📋 Меню", "🛒 Корзина"],
        ["📞 Контакты", "❓ Помощь"],
      ],
      resize_keyboard: true,
    };

    ctx.reply("Добро пожаловать в наше уютное кафе! 🍰☕\nВыберите действие:", { 
      reply_markup: menuKeyboard 
    });
    Logger.info(`Пользователь ${ctx.from?.id} запустил бота`);
  },

  id: (ctx: any) => {
    const userId = ctx.from?.id;
    ctx.reply(`Ваш ID: ${userId}`);
    Logger.info(`Пользователь запросил ID: ${userId}`);
  },

  orders: BotService.handleOrdersCommand
};