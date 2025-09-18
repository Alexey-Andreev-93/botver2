// services/UserStateService.ts

export interface UserState {
  state: 'menu' | 'ordering' | 'awaiting_name' | 'awaiting_phone' | 'awaiting_comment';
  data: {
    name?: string;
    phone?: string;
    cart?: any[];
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
    const currentState = this.getState(userId) || { state: 'menu', data: {} };
    this.setState(userId, { ...currentState, ...updates });
  }

  clearState(userId: number): void {
    this.states.delete(userId);
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

  // Очистка старых состояний (можно добавить по таймеру)
  cleanupOldStates(timeoutMinutes: number = 30): void {
    // В будущем можно добавить логику очистки старых состояний
    console.log(`✅ Сервис состояний: ${this.states.size} активных состояний`);
  }
}

// Экспортируем singleton instance
export const userStateService = new UserStateService();