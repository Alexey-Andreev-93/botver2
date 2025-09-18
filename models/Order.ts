// models/Order.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

// Определяем атрибуты заказа
interface OrderAttributes {
  id: number;
  user_id: number;
  user_name: string;
  user_phone?: string;
  items: string;
  total_amount: number;
  status: 'new' | 'confirmed' | 'completed' | 'cancelled';
  created_at: Date;
}

// Атрибуты для создания нового заказа
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'created_at'> {}

// Модель заказа
export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public user_id!: number;
  public user_name!: string;
  public user_phone?: string;
  public items!: string;
  public total_amount!: number;
  public status!: 'new' | 'confirmed' | 'completed' | 'cancelled';
  public created_at!: Date;
}

// Инициализация модели
Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    items: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'confirmed', 'completed', 'cancelled'),
      defaultValue: 'new',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: false,
  }
);