declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test';
    DATABASE_URL?: string;
    PORT?: string;
    HOSTNAME?: string;
    JWT_SECRET?: string;
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
  exit(code?: number): never;
};

// Deklaracje modułów stylów i zasobów statycznych (Next.js / TypeScript side-effect imports)
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare module '*.jpeg' {
  const content: any;
  export default content;
}

declare module '*.webp' {
  const content: any;
  export default content;
}

// Fallback deklaracje dla edytora hosta (gdy node_modules znajduje się w odizolowanym wolumenie Dockera)
declare module 'next/headers' {
  export interface ReadonlyRequestCookies {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): Array<{ name: string; value: string }>;
    has(name: string): boolean;
    set(name: string, value: string, options?: any): void;
    delete(name: string): void;
  }
  export function cookies(): Promise<ReadonlyRequestCookies>;
  export function headers(): Promise<Headers>;
}

declare module 'next/cache' {
  export function revalidatePath(path: string, type?: 'page' | 'layout'): void;
  export function revalidateTag(tag: string): void;
}

declare module 'next/server' {
  export class NextRequest extends Request {
    nextUrl: URL;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      has(name: string): boolean;
      set(name: string, value: string, options?: any): void;
      delete(name: string): void;
    };
  }

  export class NextResponse extends Response {
    static next(): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static json(body: any, init?: ResponseInit): NextResponse;
    cookies: {
      set(name: string, value: string, options?: any): void;
      delete(name: string): void;
    };
  }
}

declare module 'jose' {
  export class SignJWT {
    constructor(payload?: Record<string, any>);
    setProtectedHeader(header: { alg: string; [key: string]: any }): this;
    setIssuedAt(issuedAt?: number): this;
    setExpirationTime(expirationTime: number | string): this;
    sign(key: Uint8Array | any): Promise<string>;
  }

  export interface JWTVerifyResult {
    payload: Record<string, any>;
    protectedHeader: Record<string, any>;
  }

  export function jwtVerify(
    jwt: string | Uint8Array,
    key: Uint8Array | any,
    options?: any
  ): Promise<JWTVerifyResult>;
}

declare module 'bcryptjs' {
  export function hash(s: string, salt: number | string): Promise<string>;
  export function compare(s: string, hash: string): Promise<boolean>;
  export function genSalt(rounds?: number): Promise<string>;
}

declare module 'zod' {
  export interface ZodIssue {
    path: (string | number)[];
    message: string;
    code?: string;
  }

  export interface ZodError {
    flatten(): {
      formErrors: string[];
      fieldErrors: Record<string, string[] | undefined>;
    };
    issues: ZodIssue[];
    errors: ZodIssue[];
  }

  export interface ZodSafeParseResult<T> {
    success: boolean;
    data: T;
    error: ZodError;
  }

  export interface ZodType<T = any> {
    parse(data: unknown): T;
    safeParse(data: unknown): ZodSafeParseResult<T>;
    optional(): ZodType<T | undefined>;
    or<U>(other: ZodType<U>): ZodType<T | U>;
    default(def: T): ZodType<T>;
  }

  export interface ZodString extends ZodType<string> {
    email(message?: string): ZodString;
    min(length: number, message?: string): ZodString;
    max(length: number, message?: string): ZodString;
    url(message?: string): ZodString;
    length(len: number, message?: string): ZodString;
    regex(pattern: RegExp, message?: string): ZodString;
    trim(): ZodString;
  }

  export interface ZodNumber extends ZodType<number> {
    min(value: number, message?: string): ZodNumber;
    max(value: number, message?: string): ZodNumber;
  }

  export interface ZodArray<T = any> extends ZodType<T[]> {
    min(length: number, message?: string): ZodArray<T>;
    max(length: number, message?: string): ZodArray<T>;
    default(def: T[]): ZodArray<T>;
  }

  export interface ZodObject<T extends Record<string, ZodType>> extends ZodType<{ [K in keyof T]: any }> {
    extend<E extends Record<string, ZodType>>(shape: E): ZodObject<T & E>;
    pick<K extends string>(keys: Record<K, true>): ZodObject<any>;
  }

  export namespace z {
    type infer<T> = T extends ZodType<infer U> ? U : any;
  }

  export const z: {
    string(params?: any): ZodString;
    number(params?: any): ZodNumber;
    boolean(params?: any): ZodType<boolean>;
    object<T extends Record<string, ZodType>>(shape: T): ZodObject<T>;
    enum(values: readonly string[] | string[], params?: any): ZodType<string>;
    literal<L extends string | number | boolean>(val: L): ZodType<L>;
    array<E extends ZodType>(element: E): ZodArray<any>;
    coerce: {
      number(params?: any): ZodNumber;
      string(params?: any): ZodString;
      boolean(): ZodType<boolean>;
    };
  };
}
