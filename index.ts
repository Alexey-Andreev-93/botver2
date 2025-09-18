// Импорты и настройка окружения
import * as dotenv from "dotenv";
dotenv.config();

import { Telegraf } from "telegraf";
import { initDatabase } from "./database";
import { Logger } from "./utils/logger";
import { BotService } from "./services/BotService";
import { commandHandlers } from "./handlers/commandHandlers";
import { hearsHandlers } from "./handlers/hearsHandlers";
import { callbackHandlers } from "./handlers/callbackHandlers";
import { textHandlers } from "./handlers/textHandlers";

// Проверка токена бота
const BOT_TOKEN = process.env.BOT_TOKEN || "";
if (BOT_TOKEN === "") {
  Logger.error("Переменная окружения BOT_TOKEN не задана!");
  process.exit(1);
}

// Создание экземпляра бота
const bot = new Telegraf(BOT_TOKEN);

// Регистрация обработчиков команд
bot.start(commandHandlers.start);
bot.command("id", commandHandlers.id);
bot.command("orders", commandHandlers.orders);

// Регистрация обработчиков кнопок главного меню
bot.hears("📋 Меню", hearsHandlers.menu);
bot.hears("🛒 Корзина", hearsHandlers.cart);
bot.hears("📞 Контакты", hearsHandlers.contacts);
bot.hears("❓ Помощь", hearsHandlers.help);

// Регистрация обработчиков callback-кнопок
bot.action(/add_(\d+)/, (ctx) => callbackHandlers.addItem(ctx, ctx.match));
bot.action("view_cart", callbackHandlers.viewCart);
bot.action("checkout", callbackHandlers.checkout);
bot.action("clear_cart", callbackHandlers.clearCart);
bot.action("add_more", callbackHandlers.addMore);
bot.action("back_to_menu", callbackHandlers.backToMenu);
bot.action("ignore", callbackHandlers.ignore);

// Регистрация обработчика текста
bot.on("text", textHandlers.processText);

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