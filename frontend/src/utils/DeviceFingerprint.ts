interface FingerprintComponents {
  userAgent: string;
  language: string;
  languages: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  maxTouchPoints: number;
  screenResolution: string;
  screenColorDepth: number;
  screenPixelDepth: number;
  timezone: string;
  webglVendor: string;
  webglRenderer: string;
  canvas: string;
  localStorageEnabled: boolean;
  indexedDBEnabled: boolean;
}

export class DeviceFingerprint {
  static async generateFingerprint(): Promise<string> {
    const components: FingerprintComponents = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(',') || '',
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as any).deviceMemory || 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      screenResolution: `${screen.width}x${screen.height}`,
      screenColorDepth: screen.colorDepth,
      screenPixelDepth: screen.pixelDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      webglVendor: this.getWebGLVendor(),
      webglRenderer: this.getWebGLRenderer(),
      canvas: await this.getCanvasFingerprint(),
      localStorageEnabled: this.checkLocalStorageEnabled(),
      indexedDBEnabled: this.checkIndexedDBEnabled(),
    };

    return this.hashComponents(components);
  }

  static getWebGLVendor(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) as string : 'unknown';
      }
    } catch {
      return 'unknown';
    }
    return 'unknown';
  }

  static getWebGLRenderer(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string : 'unknown';
      }
    } catch {
      return 'unknown';
    }
    return 'unknown';
  }

  static async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 280;
      canvas.height = 60;

      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Device Fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device Fingerprint', 4, 17);

      return canvas.toDataURL().slice(-30);
    } catch {
      return 'canvas-error';
    }
  }

  static checkLocalStorageEnabled(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static checkIndexedDBEnabled(): boolean {
    try {
      return !!window.indexedDB;
    } catch {
      return false;
    }
  }

  static hashComponents(components: FingerprintComponents): string {
    const str = JSON.stringify(components);
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  static getStoredFingerprint(): string | null {
    try {
      return localStorage.getItem('device_fingerprint');
    } catch {
      return null;
    }
  }

  static storeFingerprint(fingerprint: string): boolean {
    try {
      localStorage.setItem('device_fingerprint', fingerprint);
      return true;
    } catch {
      return false;
    }
  }

  static clearStoredFingerprint(): boolean {
    try {
      localStorage.removeItem('device_fingerprint');
      return true;
    } catch {
      return false;
    }
  }
}
