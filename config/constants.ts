export const MENU_ITEMS = [
  // Медовики
  { id: 1, name: "Медовик разнотравье", price: 189, category: "medoviki", emoji: "🍯" },
  { id: 2, name: "Медовик гречишный", price: 199, category: "medoviki", emoji: "🌾" },
  { id: 3, name: "Медовик каштановый", price: 229, category: "medoviki", emoji: "🌰" },
  { id: 4, name: "Медовик с брусникой", price: 219, category: "medoviki", emoji: "🫐" },
  { id: 5, name: "Медовик с алоэ", price: 229, category: "medoviki", emoji: "🌿" },
  { id: 6, name: "Медовик манго-облепиха", price: 219, category: "medoviki", emoji: "🥭" },
  { id: 7, name: "Медовик малина-фисташка", price: 259, category: "medoviki", emoji: "🍓" },
  { id: 8, name: "Медовик Бейлис-чизкейк", price: 239, category: "medoviki", emoji: "🍦" },
  { id: 9, name: "Медовик яблоко-грецкий орех", price: 229, category: "medoviki", emoji: "🍎" },
  
  // Торты и пирожные
  { id: 10, name: "Наполеон с заварным кремом", price: 220, category: "cakes", emoji: "🍰" },
  { id: 11, name: "Наполеон лесные ягоды", price: 240, category: "cakes", emoji: "🫐" },
  { id: 12, name: "Картошка с амаретто", price: 90, category: "cakes", emoji: "🥔" },
  { id: 13, name: "Сникерс", price: 135, category: "cakes", emoji: "🍫" },
  { id: 14, name: "Маракуйя в молочном шоколаде", price: 230, category: "cakes", emoji: "🌺" },
  { id: 15, name: "Шоколадный пирог-чизкейк с вишней", price: 195, category: "cakes", emoji: "🍒" },
  { id: 16, name: "Меренговый рулет с малиной, фисташкой и маскарпоне", price: 280, category: "cakes", emoji: "🍓", unit: "100гр" },
  
  // Комплексные обеды
  { id: 17, name: "Комплексный обед", price: 350, category: "lunch", emoji: "🥗" }
];

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