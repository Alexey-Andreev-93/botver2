// handlers/callbackHandlers.ts
import { MenuService } from "../services/MenuService";
import { userStateService } from "../services/UserStateService";
import { Logger } from "../utils/logger";

export const callbackHandlers = {
  addItem: async (ctx: any, match: RegExpMatchArray) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const itemId = parseInt(match[1]);
    const menuItem = MenuService.getMenuItem(itemId);
    
    if (!menuItem) {
      ctx.answerCbQuery("Товар не найден");
      return;
    }

    userStateService.addToCart(userId, {
      id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      emoji: menuItem.emoji
    });

    ctx.answerCbQuery(`✅ ${menuItem.emoji} ${menuItem.name} добавлен в корзину!`);
    Logger.info(`Пользователь ${userId} добавил в корзину: ${menuItem.name}`);
  },

  viewCart: async (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    ctx.answerCbQuery();
    // BotService.showCart будет вызван из основного обработчика
  },

  checkout: async (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const state = userStateService.getState(userId);
    if (!state || state.data.cart.length === 0) {
      ctx.answerCbQuery("Корзина пуста");
      return;
    }

    userStateService.updateState(userId, { 
      state: "awaiting_name", 
      data: { ...state.data } 
    });

    ctx.editMessageText("Отлично! Для оформления заказа, пожалуйста, напишите ваше имя:");
    Logger.info(`Пользователь ${userId} начал оформление заказа`);
  },

  clearCart: async (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    userStateService.clearCart(userId);
    ctx.answerCbQuery("🗑️ Корзина очищена");
    ctx.deleteMessage();
    Logger.info(`Пользователь ${userId} очистил корзину`);
  },

  addMore: async (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    ctx.deleteMessage();
    const keyboard = MenuService.createMenuKeyboard();

    ctx.reply("🍽 *Меню нашего кафе:*", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  },

  backToMenu: async (ctx: any) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    ctx.deleteMessage();
    const keyboard = MenuService.createMenuKeyboard();

    ctx.reply("🍽 *Меню нашего кафе:*", {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  },

  ignore: (ctx: any) => {
    ctx.answerCbQuery(""); // Просто пустой ответ
  }
};