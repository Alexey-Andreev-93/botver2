// services/BotService.ts
import { Telegraf } from "telegraf";
import { userStateService } from "./UserStateService";
import { Order } from "../models/Order";
import { CONSTANTS } from "../config/constants";
import { Logger } from "../utils/logger";

export class BotService {
  static showCart(ctx: any, userId: number) {
    const state = userStateService.getState(userId);
    const cart = state?.data.cart || [];
    const total = userStateService.getCartTotal(userId);

    if (cart.length === 0) {
      ctx.reply("🛒 Ваша корзина пуста");
      return;
    }

    let cartText = "🛒 *Ваша корзина:*\n\n";
    cart.forEach((item, index) => {
      cartText += `${index + 1}. ${item.emoji} ${item.name} - ${item.price}₽ x ${item.quantity} = ${item.price * item.quantity}₽\n`;
    });
    
    cartText += `\n💵 *Итого: ${total}₽*`;

    const keyboard = [
      [{ text: "➕ Добавить еще товаров", callback_data: "add_more" }],
      [{ text: "✅ Оформить заказ", callback_data: "checkout" }],
      [{ text: "🗑️ Очистить корзину", callback_data: "clear_cart" }],
      [{ text: "📋 Вернуться к меню", callback_data: "back_to_menu" }]
    ];

    ctx.reply(cartText, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: keyboard }
    });
  }

  static async handleOrdersCommand(ctx: any) {
    const userId = ctx.from?.id;
    
    if (userId !== CONSTANTS.BOT.ADMIN_ID) {
      Logger.warn(`Пользователь ${userId} попытался получить доступ к админ-команде`);
      return ctx.reply(CONSTANTS.MESSAGES.NO_ACCESS);
    }

    try {
      const orders = await Order.findAll({
        order: [['created_at', 'DESC']],
        limit: 10
      });

      if (orders.length === 0) {
        Logger.info("Админ запросил заказы - заказов нет");
        return ctx.reply(CONSTANTS.MESSAGES.NO_ORDERS);
      }

      let ordersText = "📋 Последние заказы:\n\n";
      
      orders.forEach(order => {
        ordersText += `#${order.id} • ${order.user_name}\n`;
        ordersText += `📞 ${order.user_phone || 'не указан'}\n`;
        ordersText += `🍽 ${order.items}\n`;
        ordersText += `💰 ${order.total_amount} руб.\n`;
        ordersText += `📊 Статус: ${order.status}\n`;
        ordersText += `🕒 ${order.created_at.toLocaleString('ru-RU')}\n`;
        ordersText += "━━━━━━━━━━━━━━━━\n";
      });

      if (ordersText.length > 4000) {
        ordersText = ordersText.substring(0, 4000) + "\n... (показаны первые 4000 символов)";
      }
      
      ctx.reply(ordersText);
      Logger.info(`Админ просмотрел ${orders.length} заказов`);
      
    } catch (error) {
      Logger.error("Ошибка получения заказов:", error);
      ctx.reply(CONSTANTS.MESSAGES.ORDERS_ERROR);
    }
  }
}