// Импорты и настройка окружения
import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";
import { initDatabase } from "./database";
import { Order } from "./models/Order";
import { userStateService } from "./services/UserStateService";
import { ValidationService } from "./services/ValidationService";
import { Logger } from "./utils/logger";
import { CONSTANTS, MENU_ITEMS } from "./config/constants";

// Проверка токена бота
const BOT_TOKEN = process.env.BOT_TOKEN || "";
if (BOT_TOKEN === "") {
  Logger.error("Переменная окружения BOT_TOKEN не задана!");
  process.exit(1);
}

// Создание экземпляра бота
const bot = new Telegraf(BOT_TOKEN);

// Функция для форматирования меню
function formatMenu() {
  let menuText = "🍽 *МЕНЮ* 🍽\n\n";
  
  // Группируем товары по категориям
  const categories: { [key: string]: any[] } = {};
  MENU_ITEMS.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  // Добавляем медовики
  menuText += "🍰 *МЕДОВИКИ* 🍯\n\n";
  categories.medoviki.forEach(item => {
    menuText += `${item.emoji} ${item.name} - ${item.price}₽\n`;
  });

  // Добавляем торты
  menuText += "\n🎂 *ТОРТЫ И ПИРОЖНЫЕ* \n\n";
  categories.cakes.forEach(item => {
    const unit = item.unit ? `/${item.unit}` : '';
    menuText += `${item.emoji} ${item.name} - ${item.price}₽${unit}\n`;
  });

  // Добавляем обеды
  menuText += "\n🍽 *КОМПЛЕКСНЫЕ ОБЕДЫ* \n\n";
  categories.lunch.forEach(item => {
    menuText += `${item.emoji} ${item.name} - ${item.price}₽\n`;
  });

  menuText += "\n_Чтобы добавить в корзину, нажмите на кнопку с товаром_ 👇";
  return menuText;
}

// Функция для создания клавиатуры меню
function createMenuKeyboard() {
  const keyboard = [];
  
  // Добавляем кнопки товаров
  MENU_ITEMS.forEach(item => {
    keyboard.push([{ 
      text: `${item.emoji} ${item.name} - ${item.price}₽`, 
      callback_data: `add_${item.id}` 
    }]);
  });
  
  // Добавляем кнопки управления
  keyboard.push([{ text: "🛒 Корзина", callback_data: "view_cart" }]);
  keyboard.push([{ text: "📋 Главное меню", callback_data: "main_menu" }]);

  return keyboard;
}

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
    cartText += `${index + 1}. ${item.emoji} ${item.name} - ${item.price}₽ x ${item.quantity} = ${item.price * item.quantity}₽\n`;
  });
  
  cartText += `\n💵 *Итого: ${total}₽*`;

  const keyboard = [
    [{ text: "➕ Добавить еще", callback_data: "add_more" }],
    [{ text: "✅ Оформить заказ", callback_data: "checkout" }],
    [{ text: "🗑️ Очистить корзину", callback_data: "clear_cart" }],
    [{ text: "📋 Вернуться к меню", callback_data: "back_to_menu" }]
  ];

  ctx.reply(cartText, {
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard }
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

  ctx.reply(CONSTANTS.MESSAGES.WELCOME, { reply_markup: menuKeyboard });
  Logger.info(`Пользователь ${ctx.from?.id} запустил бота`);
});

// Обработка кнопки "Меню"
bot.hears("📋 Меню", (ctx) => {
  const menuText = formatMenu();
  const keyboard = createMenuKeyboard();

  ctx.reply(menuText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
  Logger.debug(`Пользователь ${ctx.from?.id} запросил меню`);
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
🕒 Часы работы: 9:00 - 21:00 без выходных
📱 Телефон: +7 (XXX) XXX-XX-XX
🌐 Сайт: cafe-sweet-bake.ru
  `;
  ctx.reply(contactText);
});

// Обработка кнопки "Помощь"
bot.hears("❓ Помощь", (ctx) => {
  const helpText = `
Я бот-помощник кафе "Sweet Bake"!

Вот что я умею:
• Показывать актуальное меню 🍽
• Принимать заказы с выбором блюд 🛒
• Сообщать контакты и адрес 📞

Просто нажимайте на кнопки внизу экрана!
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
});

// Обработка callback-кнопок
bot.action(/add_(\d+)/, async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  const itemId = parseInt(ctx.match[1]);
  const menuItem = MENU_ITEMS.find(item => item.id === itemId);
  
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
    emoji: menuItem.emoji
  });

  ctx.answerCbQuery(`✅ ${menuItem.emoji} ${menuItem.name} добавлен в корзину!`);
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
    data: { ...state.data } 
  });

  ctx.editMessageText("Отлично! Для оформления заказа, пожалуйста, напишите ваше имя:");
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
  const menuText = formatMenu();
  const keyboard = createMenuKeyboard();

  ctx.reply(menuText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
});

// Вернуться к меню
bot.action("back_to_menu", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.deleteMessage();
  const menuText = formatMenu();
  const keyboard = createMenuKeyboard();

  ctx.reply(menuText, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: keyboard
    }
  });
});

// Главное меню
bot.action("main_menu", async (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  ctx.deleteMessage();
  const menuKeyboard = {
    keyboard: [
      ["📋 Меню", "🛒 Корзина"],
      ["📞 Контакты", "❓ Помощь"],
    ],
    resize_keyboard: true,
  };

  ctx.reply("Главное меню:", { reply_markup: menuKeyboard });
});

// Обработка ввода текста (для оформления заказа)
bot.on("text", async (ctx) => {
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