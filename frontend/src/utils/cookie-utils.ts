/**
 * A type-safe cookie utility library with full TypeScript support
 */
export class CookieManager {
  /**
   * Set a cookie with various options
   * @param name Cookie name
   * @param value Cookie value
   * @param options Cookie options
   */
  static set(
    name: string,
    value: string,
    options: {
      expires?: Date | number | string;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'Lax' | 'Strict' | 'None';
      httpOnly?: boolean;
    } = {}
  ): void {
    if (typeof document === 'undefined') {
      console.warn('Document is not available. Cookies can only be set in browser environments.');
      return;
    }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Handle expiration
    if (options.expires) {
      let expiresDate: Date;

      if (typeof options.expires === 'number') {
        expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + options.expires * 24 * 60 * 60 * 1000);
      } else if (typeof options.expires === 'string') {
        expiresDate = new Date(options.expires);
      } else {
        expiresDate = options.expires;
      }

      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }

    // Add other options
    if (options.path) cookieString += `; path=${options.path}`;
    if (options.domain) cookieString += `; domain=${options.domain}`;
    if (options.secure) cookieString += '; secure';
    if (options.sameSite) cookieString += `; samesite=${options.sameSite}`;
    if (options.httpOnly) {
      console.warn('httpOnly flag cannot be set from client-side JavaScript');
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   * @param name Cookie name to retrieve
   * @returns The cookie value or null if not found
   */
  static get(name: string): string | null {
    if (typeof document === 'undefined') {
      console.warn('Document is not available. Cookies can only be read in browser environments.');
      return null;
    }

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (decodeURIComponent(cookieName) === name) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }

  /**
   * Delete a cookie by name
   * @param name Cookie name to delete
   * @param path Optional path that was used when setting the cookie
   * @param domain Optional domain that was used when setting the cookie
   */
  static delete(name: string, path?: string, domain?: string): void {
    this.set(name, '', {
      expires: new Date(0),
      path,
      domain,
    });
  }

  /**
   * Check if a cookie exists
   * @param name Cookie name to check
   * @returns Boolean indicating if the cookie exists
   */
  static has(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Get all cookies as a key-value object
   * @returns Object containing all cookies
   */
  static getAll(): Record<string, string> {
    if (typeof document === 'undefined') {
      console.warn('Document is not available. Cookies can only be read in browser environments.');
      return {};
    }

    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    });
    return cookies;
  }
}