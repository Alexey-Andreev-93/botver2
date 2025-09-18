// handlers/textHandlers.ts
import { userStateService } from "../services/UserStateService";
import { ValidationService } from "../services/ValidationService";
import { Order } from "../models/Order";
import { CONSTANTS } from "../config/constants";
import { Logger } from "../utils/logger";

export const textHandlers = {
  processText: async (ctx: any) => {
    const userId = ctx.from?.id;
    const messageText = ctx.message.text;

    if (!userId) return;

    // Игнорируем команды
    if (messageText.startsWith('/')) {
      return;
    }

    // Игнорируем кнопки главного меню
    if (["📋 Меню", "🛒 Корзина", "📞 Контакты", "❓ Помощь"].includes(messageText)) {
      return;
    }

    const userState = userStateService.getState(userId);

    if (userState?.state === "awaiting_name") {
      // Валидация имени
      const validation = ValidationService.isValidName(messageText);
      if (!validation.isValid) {
        ctx.reply(validation.message || "Пожалуйста, введите корректное имя");
        return;
      }

      // Сохраняем имя и запрашиваем телефон
      userStateService.updateState(userId, {
        state: "awaiting_phone",
        data: { ...userState.data, name: messageText.trim() }
      });

      ctx.reply("Спасибо! Теперь укажите ваш телефон для связи:");
      Logger.info(`Пользователь ${userId} ввел имя: ${messageText}`);

    } else if (userState?.state === "awaiting_phone") {
      // Валидация телефона
      const validation = ValidationService.isValidPhone(messageText);
      if (!validation.isValid) {
        ctx.reply(validation.message || "Пожалуйста, введите корректный телефон");
        return;
      }

      const formattedPhone = ValidationService.formatPhone(messageText);

      try {
        // Создаем заказ в базе данных
        const order = await Order.create({
          user_id: userId,
          user_name: userState.data.name!,
          user_phone: formattedPhone,
          items: userState.data.cart.map(item => 
            `${item.emoji} ${item.name} x${item.quantity}`
          ).join(", "),
          total_amount: userStateService.getCartTotal(userId),
          status: CONSTANTS.ORDER.STATUS.NEW,
        });

        // Очищаем состояние пользователя и корзину
        userStateService.clearState(userId);
        userStateService.clearCart(userId);

        ctx.reply(
          `🎉 Спасибо, ${userState.data.name}!\n\nВаш заказ #${order.id} принят! 📋\nМы свяжемся с вами по телефону ${formattedPhone} для подтверждения 📞\n\nСумма к оплате: ${order.total_amount}₽`
        );

        Logger.success(`Новый заказ #${order.id} от ${userState.data.name} (${userId}) на сумму ${order.total_amount}₽`);
        
      } catch (error) {
        Logger.error("Ошибка создания заказа:", error);
        ctx.reply(CONSTANTS.MESSAGES.ORDER_ERROR);
      }
    }
  }
};