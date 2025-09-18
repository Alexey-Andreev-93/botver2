// services/UserStateService.ts

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  emoji?: string;
}

export interface UserState {
  state:
    | "menu"
    | "browsing"
    | "awaiting_name"
    | "awaiting_phone"
    | "awaiting_comment"
    | "cart";
  data: {
    name?: string;
    phone?: string;
    cart: CartItem[];
    comment?: string;
  };
}

export class UserStateService {
  private states: Map<number, UserState> = new Map();

  getState(userId: number): UserState | null {
    return this.states.get(userId) || null;
  }

  setState(userId: number, state: UserState): void {
    this.states.set(userId, state);
  }

  updateState(userId: number, updates: Partial<UserState>): void {
    const currentState = this.getState(userId) || {
      state: "menu",
      data: { cart: [] },
    };
    this.setState(userId, { ...currentState, ...updates });
  }

  clearState(userId: number): void {
    this.states.delete(userId);
  }

  // Методы для работы с корзиной
  addToCart(userId: number, item: CartItem): void {
    const state = this.getState(userId) || {
      state: "menu",
      data: { cart: [] },
    };
    const existingItem = state.data.cart.find(
      (cartItem) => cartItem.id === item.id
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      state.data.cart.push(item);
    }

    this.setState(userId, state);
  }

  removeFromCart(userId: number, itemId: number): void {
    const state = this.getState(userId);
    if (state) {
      state.data.cart = state.data.cart.filter((item) => item.id !== itemId);
      this.setState(userId, state);
    }
  }

  updateCartItemQuantity(
    userId: number,
    itemId: number,
    quantity: number
  ): void {
    const state = this.getState(userId);
    if (state) {
      const item = state.data.cart.find((item) => item.id === itemId);
      if (item) {
        item.quantity = quantity;
        if (item.quantity <= 0) {
          this.removeFromCart(userId, itemId);
        } else {
          this.setState(userId, state);
        }
      }
    }
  }

  clearCart(userId: number): void {
    const state = this.getState(userId);
    if (state) {
      state.data.cart = [];
      this.setState(userId, state);
    }
  }

  getCartTotal(userId: number): number {
    const state = this.getState(userId);
    if (!state) return 0;

    return state.data.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }
  // Получить состояние по типу
  getUserByState(stateType: string): number | null {
    for (const [userId, state] of this.states.entries()) {
      if (state.state === stateType) {
        return userId;
      }
    }
    return null;
  }

  // Очистка старых состояний
  cleanupOldStates(timeoutMinutes: number = 30): void {
    console.log(`✅ Сервис состояний: ${this.states.size} активных состояний`);
  }
}

// Экспортируем singleton instance
export const userStateService = new UserStateService();
