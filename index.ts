// Импорты и настройка окружения
import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";
import { initDatabase } from "./database";
import { Order } from "./models/Order";
import { userStateService } from "./services/UserStateService";
import { ValidationService } from "./services/ValidationService";
import { MenuService } from "./services/MenuService";
import { Logger } from "./utils/logger";
import { CONSTANTS } from "./config/constants";

// Проверка токена бота

const BOT_TOKEN = process.env.BOT_TOKEN || "";
if (BOT_TOKEN === "") {
  Logger.error("Переменная окружения BOT_TOKEN не задана!");
  process.exit(1);
}

// Создание экземпляра бота
const bot = new Telegraf(BOT_TOKEN);

// Функция для отображения корзины
function showCart(ctx: any, userId: number) {
  const state = userStateService.getState(userId);
  const cart = state?.data.cart || [];
  const total = userStateService.getCartTotal(userId);

  if (cart.length === 0) {
    ctx.reply("🛒 Ваша корзина пуста");
    return;
  }

  let cartText = "🛒 *Ваша корзина:*\n\n";
  cart.forEach((item, index) => {
    cartText += `${index + 1}. ${item.emoji} ${item.name} - ${item.price}₽ x ${
      item.quantity
    } = ${item.price * item.quantity}₽\n`;
  });

  cartText += `\n💵 *Итого: ${total}₽*`;

  const keyboard = [
    [{ text: "➕ Добавить еще товаров", callback_data: "add_more" }],
    [{ text: "✅ Оформить заказ", callback_data: "checkout" }],
    [{ text: "🗑️ Очистить корзину", callback_data: "clear_cart" }],
    [{ text: "📋 Вернуться к меню", callback_data: "back_to_menu" }],
  ];

  ctx.reply(cartText, {
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard },
  });
}

// Обработка команды /start - главное меню
bot.start((ctx) => {
  const menuKeyboard = {
    keyboard: [
      ["📋 Меню", "🛒 Корзина"],
      ["📞 Контакты", "❓ Помощь"],
    ],
    resize_keyboard: true,
  };

  ctx.reply("Добро пожаловать в наше уютное кафе! 🍰☕\nВыберите действие:", {
    reply_markup: menuKeyboard,
  });
  Logger.info(`Пользователь ${ctx.from?.id} запустил бота`);
});

// Обработка кнопки "Меню"
bot.hears("📋 Меню", (ctx) => {
  const keyboard = MenuService.createMenuKeyboard();

  ctx.reply("🍽 *Меню нашего кафе:*", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
  Logger.debug(`Пользователь ${ctx.from?.id} открыл меню`);
});

// Игнорируем клики по заголовкам и ненужным кнопкам
bot.action("ignore", (ctx) => {
  ctx.answerCbQuery(""); // Просто пустой ответ
});

// Обработка кнопки "Корзина"
bot.hears("🛒 Корзина", (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  showCart(ctx, userId);
});

// Обработка кнопки "Контакты"
bot.hears("📞 Контакты", (ctx) => {
  const contactText = `
📍 Наш адрес: Улица Пушкина, дом Колотушкина
🕒 Часы работы: 08:00-20:00🧸
📱 Телефон: +7 962 715 9858
🌐 Группа в Телеграме: https://t.me/kofemedovik
  `;
  ctx.reply(contactText);
});

// Обработка кнопки "Помощь"
bot.hears("❓ Помощь", (ctx) => {
  const helpText = `
Я бот-помощник кафе "Медовик"!

Вот что я умею:
• Показывать меню с выбором блюд 🍽
• Принимать заказы с корзиной товаров 🛒
• Сообщать контакты и адрес 📞

Просто нажимайте на кнопки!
  `;
  ctx.reply(helpText);
});

// Команда для получения своего ID
bot.command("id", (ctx) => {
  const userId = ctx.from?.id;
  ctx.reply(`Ваш ID: ${userId}`);
  Logger.info(`Пользователь запросил ID: ${userId}`);
});

// Админ-команда для просмотра заказов

bot.command("orders", async (ctx) => {
  const userId = ctx.from?.id;

  if (userId !== CONSTANTS.BOT.ADMIN_ID) {
    Logger.warn(
      `Пользователь ${userId} попытался получить доступ к админ-команде`
    );
    return ctx.reply(CONSTANTS.MESSAGES.NO_ACCESS);
  }

  try {
    const orders = await Order.findAll({
      order: [["created_at", "DESC"]],
      limit: 10,
    });

    if (orders.length === 0) {
      Logger.info("Админ запросил заказы - заказов нет");
      return ctx.reply(CONSTANTS.MESSAGES.NO_ORDERS);
    }

    let ordersText = "📋 Последние заказы:\n\n";

    orders.forEach((order) => {
      ordersText += `#${order.id} • ${order.user_name}\n`;
      ordersText += `📞 ${order.user_phone || "не указан"}\n`;
      ordersText += `🍽 ${order.items}\n`;
      ordersText += `💰 ${order.total_amount} руб.\n`;
      ordersText += `📊 Статус: ${order.status}\n`;
      ordersText += `🕒 ${order.created_at.toLocaleString("ru-RU")}\n`;
      ordersText += "━━━━━━━━━━━━━━━━\n";
    });

    if (ordersText.length > 4000) {
      ordersText =
        ordersText.substring(0, 4000) + "\n... (показаны первые 4000 символов)";
    }

    ctx.reply(ordersText);
    Logger.info(`Админ просмотрел ${orders.length} заказов`);
  } catch (error) {
    Logger.error("Ошибка получения заказов:", error);
    ctx.reply(CONSTANTS.MESSAGES.ORDERS_ERROR);
  }
});

// Обработка callback-кнопок товаров
bot.action(/add_(\d+)/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const itemId = parseInt(ctx.match[1]);
  const menuItem = MenuService.getMenuItem(itemId);

  if (!menuItem) {
    ctx.answerCbQuery("Товар не найден");
    return;
  }

  // Добавляем в корзину
  userStateService.addToCart(userId, {
    id: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    quantity: 1,
    emoji: menuItem.emoji,
  });

  ctx.answerCbQuery(
    `✅ ${menuItem.emoji} ${menuItem.name} добавлен в корзину!`
  );
  Logger.info(`Пользователь ${userId} добавил в корзину: ${menuItem.name}`);
});

// Просмотр корзины
bot.action("view_cart", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.answerCbQuery();
  showCart(ctx, userId);
});

// Оформление заказа
bot.action("checkout", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const state = userStateService.getState(userId);
  if (!state || state.data.cart.length === 0) {
    ctx.answerCbQuery("Корзина пуста");
    return;
  }

  userStateService.updateState(userId, {
    state: "awaiting_name",
    data: { ...state.data },
  });

  ctx.editMessageText(
    "Отлично! Для оформления заказа, пожалуйста, напишите ваше имя:"
  );
  Logger.info(`Пользователь ${userId} начал оформление заказа`);
});

// Очистка корзины
bot.action("clear_cart", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  userStateService.clearCart(userId);
  ctx.answerCbQuery("🗑️ Корзина очищена");
  ctx.deleteMessage();
  Logger.info(`Пользователь ${userId} очистил корзину`);
});

// Добавить еще товаров
bot.action("add_more", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.deleteMessage();
  const keyboard = MenuService.createMenuKeyboard();

  ctx.reply("🍽 *Выберите товар из меню:*", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
});

// Вернуться к меню
bot.action("back_to_menu", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.deleteMessage();
  const keyboard = MenuService.createMenuKeyboard();

  ctx.reply("🍽 *Выберите товар из меню:*", {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });
});

// // Главное меню
// bot.action("main_menu", async (ctx) => {
//   const userId = ctx.from?.id;
//   if (!userId) return;

//   ctx.deleteMessage();
//   const menuKeyboard = {
//     keyboard: [
//       ["📋 Меню", "🛒 Корзина"],
//       ["📞 Контакты", "❓ Помощь"],
//     ],
//     resize_keyboard: true,
//   };

//   ctx.reply("Главное меню:", { reply_markup: menuKeyboard });
// });

// Игнорируем клики по заголовкам категорий
bot.action("ignore_category", (ctx) => {
  ctx.answerCbQuery(""); // Просто пустой ответ
});

// Обработка ввода текста (для оформления заказа)
bot.on("text", async (ctx) => {
  const userId = ctx.from?.id;
  const messageText = ctx.message.text;

  if (!userId) return;

  // Игнорируем команды
  if (messageText.startsWith("/")) {
    return;
  }

  // Игнорируем кнопки главного меню
  if (
    ["📋 Меню", "🛒 Корзина", "📞 Контакты", "❓ Помощь"].includes(messageText)
  ) {
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
      data: { ...userState.data, name: messageText.trim() },
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
        items: userState.data.cart
          .map((item) => `${item.emoji} ${item.name} x${item.quantity}`)
          .join(", "),
        total_amount: userStateService.getCartTotal(userId),
        status: CONSTANTS.ORDER.STATUS.NEW,
      });

      // Очищаем состояние пользователя и корзину
      userStateService.clearState(userId);
      userStateService.clearCart(userId);

      ctx.reply(
        `🎉 Спасибо, ${userState.data.name}!\n\nВаш заказ #${order.id} принят! 📋\nМы свяжемся с вами по телефону ${formattedPhone} для подтверждения 📞\n\nСумма к оплате: ${order.total_amount}₽`
      );

      Logger.success(
        `Новый заказ #${order.id} от ${userState.data.name} (${userId}) на сумму ${order.total_amount}₽`
      );
    } catch (error) {
      Logger.error("Ошибка создания заказа:", error);
      ctx.reply(CONSTANTS.MESSAGES.ORDER_ERROR);
    }
  }
});

// Обработка ошибок бота
bot.catch((error, ctx) => {
  Logger.error("Ошибка в обработчике бота:", error);
  ctx.reply("Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.");
});

// Асинхронный запуск бота
async function startBot() {
  try {
    // Сначала инициализируем базу данных
    await initDatabase();
    Logger.success("База данных готова");

    // Очистка старых состояний при запуске
    userStateService.cleanupOldStates();

    // Затем запускаем бота
    await bot.launch();
    Logger.success("Бот успешно запущен!");

    console.log("\n📋 Доступные команды:");
    console.log("• /start - Главное меню");
    console.log("• /id - Узнать свой Telegram ID");
    console.log("• /orders - Просмотр заказов (только для админа)");
    console.log("\n✅ Все функции доступны через кнопки");
    console.log("✅ Ожидаем сообщения от пользователей...");
  } catch (error) {
    Logger.error("Ошибка запуска бота:", error);
    process.exit(1);
  }
}

// Запускаем приложение
startBot();

// Корректное завершение работы
process.once("SIGINT", () => {
  Logger.info("Остановка бота...");
  bot.stop("SIGINT");
  process.exit(0);
});

process.once("SIGTERM", () => {
  Logger.info("Остановка бота...");
  bot.stop("SIGTERM");
  process.exit(0);
});
