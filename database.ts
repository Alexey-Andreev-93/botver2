// database.ts
import { Sequelize } from 'sequelize';

// Подключаемся к SQLite базе (файл database.sqlite создастся автоматически)
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // Отключаем логи SQL запросов в консоль
});

// Функция для подключения к БД
export async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ База данных подключена успешно');
    
    // Синхронизируем модели с базой
    await sequelize.sync({ force: false });
    console.log('✅ Таблицы созданы/проверены');
    
    // Проверяем, есть ли доступ к таблице orders
    const tableExists = await sequelize.getQueryInterface().tableExists('orders');
    console.log(`✅ Таблица orders существует: ${tableExists}`);
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
}
