
import { setCookie, getCookie, removeCookie } from './cookieUtils';

// Simplified storage utility without encryption
export const encryptData = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error("Encryption (Stringify) failed:", error);
    return "";
  }
};

export const decryptData = (ciphertext: string): any => {
  try {
    return JSON.parse(ciphertext);
  } catch (error) {
    console.error("Decryption (Parse) failed:", error);
    return null;
  }
};

export const secureStorage = {
  setItem: (key: string, value: any) => {
    const stringified = JSON.stringify(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, stringified);
    }
    setCookie(key, encodeURIComponent(stringified), 7);
  },

  getItem: (key: string) => {
    let stored = null;
    
    if (typeof window !== "undefined") {
      stored = window.localStorage.getItem(key);
    }
    
    if (!stored) {
      const cookieVal = getCookie(key);
      if (cookieVal) {
        stored = decodeURIComponent(cookieVal);
      }
    }

    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to parse stored item:", e);
      return null;
    }
  },

  removeItem: (key: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key);
    }
    removeCookie(key);
  },

  clear: () => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
    removeCookie("synapstore:auth");
  }
};
