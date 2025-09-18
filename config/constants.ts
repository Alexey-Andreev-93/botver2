// config/constants.ts

export const CONSTANTS = {
  BOT: {
    ADMIN_ID: 949211099,
    IGNORED_TEXTS: ["📋 Меню", "🛒 Забронировать обед", "📞 Контакты", "❓ Помощь"],
  },
  
  ORDER: {
    DEFAULT_ITEMS: "Комплексный обед",
    DEFAULT_AMOUNT: 350, // Обновили цену с 250 на 350
    STATUS: {
      NEW: 'new' as const,
      CONFIRMED: 'confirmed' as const,
      COMPLETED: 'completed' as const,
      CANCELLED: 'cancelled' as const,
    },
  },
  
  VALIDATION: {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 50,
    },
    PHONE: {
      PATTERN: /^(\+7|7|8)?[489][0-9]{9}$/,
    },
  },
  
  MESSAGES: {
    WELCOME: `Добро пожаловать в наше уютное кафе! 🍰☕\nЯ ваш помощник-бот. Здесь вы можете посмотреть меню и забронировать обед.`,
    NO_ACCESS: "⛔ У вас нет доступа к этой команде",
    NO_ORDERS: "📭 Заказов пока нет",
    ORDER_ERROR: "Произошла ошибка при создании заказа. Попробуйте позже.",
    ORDERS_ERROR: "Произошла ошибка при получении заказов",
  },

  // Добавим категории меню для будущего использования
  MENU_CATEGORIES: {
    HONEY_CAKES: 'medoviki',
    CAKES: 'torty',
    LUNCH: 'obedy',
    DRINKS: 'napitki'
  }
};