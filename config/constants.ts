// config/constants.ts

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  emoji: string;
  weight?: string;
  unit?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  // Медовики (по 400г)
  { id: 1, name: "Медовик разнотравье", price: 189, category: "medoviki", emoji: "🍯", weight: "400г" },
  { id: 2, name: "Медовик гречишный", price: 199, category: "medoviki", emoji: "🌾", weight: "400г" },
  { id: 3, name: "Медовик каштановый", price: 229, category: "medoviki", emoji: "🌰", weight: "400г" },
  { id: 4, name: "Медовик с брусникой", price: 219, category: "medoviki", emoji: "🫐", weight: "400г" },
  { id: 5, name: "Медовик с алоэ", price: 229, category: "medoviki", emoji: "🌿", weight: "400г" },
  { id: 6, name: "Медовик манго-облепиха", price: 219, category: "medoviki", emoji: "🥭", weight: "400г" },
  { id: 7, name: "Медовик малина-фисташка", price: 259, category: "medoviki", emoji: "🍓", weight: "400г" },
  { id: 8, name: "Медовик Бейлис-чизкейк", price: 239, category: "medoviki", emoji: "🍦", weight: "400г" },
  { id: 9, name: "Медовик яблоко-грецкий орех", price: 229, category: "medoviki", emoji: "🍎", weight: "400г" },
  
  // Торты и пирожные
  { id: 10, name: "Наполеон с заварным кремом", price: 220, category: "cakes", emoji: "🍰", weight: "300г" },
  { id: 11, name: "Наполеон лесные ягоды", price: 240, category: "cakes", emoji: "🫐", weight: "300г" },
  { id: 12, name: "Картошка с амаретто", price: 90, category: "cakes", emoji: "🥔", weight: "100г" },
  { id: 13, name: "Сникерс", price: 135, category: "cakes", emoji: "🍫", weight: "150г" },
  { id: 14, name: "Маракуйя в молочном шоколаде", price: 230, category: "cakes", emoji: "🌺", weight: "250г" },
  { id: 15, name: "Шоколадный пирог-чизкейк с вишней", price: 195, category: "cakes", emoji: "🍒", weight: "200г" },
  { id: 16, name: "Меренговый рулет", price: 280, category: "cakes", emoji: "🍓", weight: "100г" },
  
  // Комплексные обеды
  { id: 17, name: "Комплексный обед", price: 350, category: "lunch", emoji: "🥗" }
];

export const CONSTANTS = {
  BOT: {
    ADMIN_ID: 949211099,
    IGNORED_TEXTS: ["📋 Меню", "🛒 Корзина", "📞 Контакты", "❓ Помощь"],
  },
  
  ORDER: {
    DEFAULT_ITEMS: "Комплексный обед",
    DEFAULT_AMOUNT: 350,
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
    WELCOME: "Добро пожаловать в наше уютное кафе! 🍰☕",
    NO_ACCESS: "⛔ У вас нет доступа к этой команде",
    NO_ORDERS: "📭 Заказов пока нет",
    ORDER_ERROR: "Произошла ошибка при создании заказа. Попробуйте позже.",
    ORDERS_ERROR: "Произошла ошибка при получении заказов",
  },

  MENU_CATEGORIES: {
    HONEY_CAKES: 'medoviki',
    CAKES: 'cakes',
    LUNCH: 'lunch',
    DRINKS: 'napitki'
  }
};