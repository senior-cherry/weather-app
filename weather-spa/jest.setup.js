import '@testing-library/jest-dom';

const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('unrecognized in this browser') ||
        args[0].includes('is using incorrect casing') ||
        args[0].includes('The tag <') ||
        args[0].includes('<linearGradient />'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: jest.fn(),
    forcedTheme: undefined,
  }),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

const structuredClonePolyfill = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => structuredClonePolyfill(item));
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error(e);
    const cloned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = structuredClonePolyfill(obj[key]);
      }
    }
    return cloned;
  }
};

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = structuredClonePolyfill;
}
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = structuredClonePolyfill;
}
if (typeof window !== 'undefined' && typeof window.structuredClone === 'undefined') {
  window.structuredClone = structuredClonePolyfill;
}
