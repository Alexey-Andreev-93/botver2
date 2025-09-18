// Импорты и настройка окружения
import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";
import { initDatabase } from "./database";
import { Order } from "./models/Order";
import { userStateService } from "./services/UserStateService";
import { ValidationService } from "./services/ValidationService";
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

// Обработка команды /start - главное меню
bot.start((ctx) => {
  const menuKeyboard = {
    keyboard: [
      ["📋 Меню", "🛒 Забронировать обед"],
      ["📞 Контакты", "❓ Помощь"],
    ],
    resize_keyboard: true,
  };

  ctx.reply(CONSTANTS.MESSAGES.WELCOME, { reply_markup: menuKeyboard });
  Logger.info(`Пользователь ${ctx.from?.id} запустил бота`);
});

// Обработка кнопки "Меню"
// Обработка кнопки "Меню"
bot.hears("📋 Меню", (ctx) => {
  const menuText = `
🍰 *МЕДОВИКИ* 🍯

🍯 Медовик разнотравье \\- 189₽
*Нежный торт с медом разнотравья*

🌾 Медовик гречишный \\- 199₽ 
*С насыщенным вкусом гречишного меда*

🌰 Медовик каштановый \\- 229₽
*С благородным каштановым медом*

🫐 Медовик с брусникой \\- 219₽
*Сладкий мед и кислинка брусники*

🌿 Медовик с алоэ \\- 229₽
*Освежающий с экстрактом алоэ*

🥭 Медовик манго\\-облепиха \\- 219₽
*Тропический микс манго и облепихи*

🍓 Медовик малина\\-фисташка \\- 259₽
*Нежная малина и хрустящая фисташка*

🍦 Медовик Бейлис\\-чизкейк \\- 239₽
*С изысканным вкусом Бейлиса*

🍎 Медовик яблоко\\-грецкий орех \\- 229₽
*Классическое сочетание с орехами*

🎂 *ТОРТЫ И ПИРОЖНЫЕ* 

🍰 Наполеон с заварным кремом \\- 220₽
*Классический с нежным заварным кремом*

🫐 Наполеон лесные ягоды \\- 240₽
*С свежими лесными ягодами*

🥔 Картошка с амаретто \\- 90₽
*Шоколадное пирожное с амаретто*

🍫 Сникерс \\- 135₽
*Арахис, нуга, карамель и шоколад*

🌺 Маракуйя в молочном шоколаде \\- 230₽
*Экзотическая маракуйя в шоколаде*

🍒 Шоколадный пирог\\-чизкейк с вишней \\- 195₽
*Шоколадный чискейк с вишневой начинкой*

🍓 Меренговый рулет с малиной, фисташкой и маскарпоне \\- 280₽/100гр
*Воздушный рулет с нежной начинкой*

🍽 *КОМПЛЕКСНЫЕ ОБЕДЫ*

🥗 Комплексный обед \\- 350₽
*Суп \\+ салат \\+ основное блюдо \\+ хлеб*

☕ *НАПИТКИ* \\(добавятся скоро\\!\\)

_Чтобы забронировать, нажмите_ 👇
`;

  ctx.replyWithMarkdownV2(menuText);
  Logger.debug(`Пользователь ${ctx.from?.id} запросил меню`);
});

// Обрабатываем кнопку "Забронировать обед"
bot.hears("🛒 Забронировать обед", (ctx) => {
  const userId = ctx.from?.id;
  if (!userId) return;

  // Сохраняем состояние пользователя
  userStateService.setState(userId, {
    state: "awaiting_name",
    data: {},
  });

  ctx.reply("Отлично! Для бронирования обеда, пожалуйста, напишите ваше имя:");
  Logger.info(`Пользователь ${userId} начал процесс бронирования`);
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
• Принимать бронирования обедов 🛒
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

    // Разбиваем сообщение если слишком длинное
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

// Обработка ввода имени для бронирования
bot.on("text", async (ctx) => {
  const userId = ctx.from?.id;
  const messageText = ctx.message.text;

  if (!userId) return;

  // Игнорируем команды (они начинаются с /)
  if (messageText.startsWith("/")) {
    return;
  }

  // Игнорируем кнопки
  if (CONSTANTS.BOT.IGNORED_TEXTS.includes(messageText)) {
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
      data: { name: messageText.trim() },
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
        items: CONSTANTS.ORDER.DEFAULT_ITEMS,
        total_amount: CONSTANTS.ORDER.DEFAULT_AMOUNT,
        status: CONSTANTS.ORDER.STATUS.NEW,
      });

      // Очищаем состояние пользователя
      userStateService.clearState(userId);

      ctx.reply(
        `🎉 *Спасибо, ${userState.data.name}!*\n\nВаш заказ #${order.id} принят! 📋\nМы свяжемся с вами по телефону ${formattedPhone} для подтверждения 📞\n\n_Сумма к оплате: ${order.total_amount}₽_`
      );

      Logger.success(
        `Новый заказ #${order.id} от ${userState.data.name} (${userId})`
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
