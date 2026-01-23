/**
 * Notification Client Class (TypeScript/Vite Friendly)
 * Supports: SSE (In-App) and Web Push (Background)
 */

export class SynapNotificationClient {
    targetId: string;
    serviceUrl: string;
    connected: boolean;
    callbacks: Array<(data: any) => void>;
    eventSource?: EventSource;
  
    constructor(targetId: string, serviceUrl: string) {
      this.targetId = targetId;
      this.serviceUrl = serviceUrl;
      this.connected = false;
      this.callbacks = [];
      
      this.connectSSE();
    }
  
    // --- SSE (In-App) ---
    connectSSE() {
      // console.log(`Connecting to SSE for target: ${this.targetId}`);
      this.eventSource = new EventSource(`${this.serviceUrl}/events?target=${this.targetId}`);
  
      this.eventSource.onopen = () => {
        this.connected = true;
        // console.log("Notification stream connected.");
      };
  
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "connected") return; 
          
          this.callbacks.forEach(cb => cb(data));
        } catch (e) {
          console.error("Error parsing notification:", e);
        }
      };
  
      this.eventSource.onerror = () => {
        this.connected = false;
        // SSE auto-reconnects usually
      };
    }
  
    onNotification(callback: (data: any) => void) {
      this.callbacks.push(callback);
    }
  
    // --- Web Push (Background) ---
    async enablePushNotifications() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push messaging is not supported");
        return;
      }
  
      try {
        // Register SW: Ensure sw.js is in /public folder
        const registration = await navigator.serviceWorker.register("/sw.js");
        // console.log("Service Worker registered");
  
        // Request Permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          throw new Error("Permission denied");
        }
  
        // Get VAPID Key from Server
        const keyRes = await fetch(`${this.serviceUrl}/vapid-key`);
        const { publicKey } = await keyRes.json();
  
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(publicKey)
        });
  
        // Send Subscription to Server
        await fetch(`${this.serviceUrl}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription,
            websiteUrl: window.location.href
          })
        });
  
        console.log("Push Notification Subscribed!");
  
      } catch (err) {
        console.error("Push Registration Error:", err);
      }
    }
  
    urlBase64ToUint8Array(base64String: string) {
      const padding = "=".repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");
  
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
  
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }
  
    disconnect() {
      if (this.eventSource) {
        this.eventSource.close();
        this.connected = false;
      }
    }
  }
