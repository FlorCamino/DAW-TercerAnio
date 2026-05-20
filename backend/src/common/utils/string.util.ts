export class StringUtil {
  static toUpperCase(value: string): string {
    return value?.toUpperCase() ?? '';
  }

  static trim(value: string): string {
    return value?.trim() ?? '';
  }

  static isEmpty(value?: string): boolean {
    return !value || value.trim().length === 0;
  }
}