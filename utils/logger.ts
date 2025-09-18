// utils/logger.ts

export class Logger {
  static info(message: string, data?: any): void {
    console.log(`ℹ️  [INFO] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`❌ [ERROR] ${new Date().toISOString()}: ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`⚠️  [WARN] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static success(message: string, data?: any): void {
    console.log(`✅ [SUCCESS] ${new Date().toISOString()}: ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    if (process.env.DEBUG === 'true') {
      console.log(`🐛 [DEBUG] ${new Date().toISOString()}: ${message}`, data || '');
    }
  }
}