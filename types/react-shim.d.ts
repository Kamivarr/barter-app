declare namespace JSX {
  type ElementType = any;
  interface Element extends React.ReactElement<any, any> {}
  interface ElementClass extends React.Component<any> {
    render(): React.ReactNode;
  }
  interface ElementAttributesProperty {
    props: {};
  }
  interface ElementChildrenAttribute {
    children: {};
  }
  type LibraryManagedAttributes<C, P> = P;
  interface IntrinsicAttributes extends React.Attributes {}
  interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  interface IntrinsicElements {
    input: React.InputHTMLAttributes<HTMLInputElement>;
    select: React.HTMLAttributes<HTMLSelectElement> & {
      value?: any;
      defaultValue?: any;
      onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
      children?: React.ReactNode;
    };
    textarea: React.HTMLAttributes<HTMLTextAreaElement> & {
      rows?: number;
      value?: any;
      defaultValue?: any;
      onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
      placeholder?: string;
    };
    button: React.ButtonHTMLAttributes<HTMLButtonElement>;
    div: React.HTMLAttributes<HTMLDivElement>;
    span: React.HTMLAttributes<HTMLSpanElement>;
    form: React.HTMLAttributes<HTMLFormElement> & {
      onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    };
    p: React.HTMLAttributes<HTMLParagraphElement>;
    h1: React.HTMLAttributes<HTMLHeadingElement>;
    h2: React.HTMLAttributes<HTMLHeadingElement>;
    h3: React.HTMLAttributes<HTMLHeadingElement>;
    h4: React.HTMLAttributes<HTMLHeadingElement>;
    h5: React.HTMLAttributes<HTMLHeadingElement>;
    h6: React.HTMLAttributes<HTMLHeadingElement>;
    a: React.HTMLAttributes<HTMLAnchorElement> & { href?: string };
    img: React.HTMLAttributes<HTMLImageElement> & {
      src?: string;
      alt?: string;
      loading?: 'lazy' | 'eager';
      width?: number | string;
      height?: number | string;
    };
    label: React.HTMLAttributes<HTMLLabelElement> & { htmlFor?: string };
    header: React.HTMLAttributes<HTMLElement>;
    footer: React.HTMLAttributes<HTMLElement>;
    main: React.HTMLAttributes<HTMLElement>;
    nav: React.HTMLAttributes<HTMLElement>;
    ul: React.HTMLAttributes<HTMLUListElement>;
    li: React.HTMLAttributes<HTMLLIElement>;
    option: React.HTMLAttributes<HTMLOptionElement> & { value?: any };
    [elemName: string]: any;
  }
}

type LayoutProps<T = any> = {
  children: React.ReactNode;
  params?: Promise<T>;
};

declare module 'react/jsx-runtime' {
  export namespace JSX {
    type ElementType = any;
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    type LibraryManagedAttributes<C, P> = P;
    interface IntrinsicAttributes extends React.Attributes {}
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  export function jsx(type: any, props: any, key?: any): JSX.Element;
  export function jsxs(type: any, props: any, key?: any): JSX.Element;
  export function jsxDEV(type: any, props: any, key?: any, isStatic?: boolean, source?: any, self?: any): JSX.Element;
  export function Fragment(props: { children?: React.ReactNode }): JSX.Element | null;
}

declare namespace React {
  type ReactNode =
    | ReactElement<any, any>
    | string
    | number
    | Iterable<ReactNode>
    | boolean
    | null
    | undefined;

  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  type Key = string | number | bigint;
  type JSXElementConstructor<P> =
    | ((props: P) => any)
    | (new (props: P) => Component<any, any>);

  interface Component<P = {}, S = {}> {}
  type FC<P = {}> = (props: P) => ReactElement<any, any> | null;
  type ComponentType<P = {}> = ComponentClass<P> | FC<P>;
  interface ComponentClass<P = {}, S = {}> {
    new (props: P, context?: any): Component<P, S>;
  }

  interface Attributes {
    key?: Key | null | undefined;
  }
  interface Ref<T> {
    current: T | null;
  }
  interface RefAttributes<T> extends Attributes {
    ref?: Ref<T> | ((instance: T | null) => void) | any;
  }
  interface ClassAttributes<T> extends Attributes {
    ref?: any;
  }

  type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
    T extends JSXElementConstructor<infer P>
      ? P
      : T extends keyof JSX.IntrinsicElements
      ? JSX.IntrinsicElements[T]
      : Record<string, any>;

  type ComponentPropsWithRef<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
    ComponentProps<T> & (T extends keyof JSX.IntrinsicElements ? RefAttributes<any> : {});

  type HTMLAttributes<T = HTMLElement> = {
    className?: string;
    style?: any;
    children?: ReactNode;
    id?: string;
    title?: string;
    role?: string;
    tabIndex?: number;
    onClick?: (e: MouseEvent<T>) => void;
    [key: string]: any;
  };

  type ButtonHTMLAttributes<T = HTMLButtonElement> = HTMLAttributes<T> & {
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    name?: string;
    value?: string | number | readonly string[];
  };

  type InputHTMLAttributes<T = HTMLInputElement> = HTMLAttributes<T> & {
    type?: string;
    value?: any;
    defaultValue?: any;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    min?: number | string;
    max?: number | string;
    maxLength?: number;
    name?: string;
    autoFocus?: boolean;
    onChange?: (e: ChangeEvent<T>) => void;
  };

  interface SyntheticEvent<T = any> {
    target: T;
    currentTarget: T;
    preventDefault(): void;
    stopPropagation(): void;
  }

  interface FormEvent<T = any> extends SyntheticEvent<T> {}
  interface ChangeEvent<T = any> extends SyntheticEvent<T> {
    target: T & { value: string };
  }
  interface MouseEvent<T = any> extends SyntheticEvent<T> {}
  interface KeyboardEvent<T = any> extends SyntheticEvent<T> {
    key: string;
    code: string;
  }

  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  function useState<T = undefined>(): [T | undefined, (newState: T | undefined | ((prevState: T | undefined) => T | undefined)) => void];
  function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  function useCallback<T extends Function>(callback: T, deps: readonly any[]): T;
  function useRef<T>(initialValue: T): { current: T };
  function useRef<T = undefined>(): { current: T | undefined };
  function useTransition(): [boolean, (callback: () => void) => void];
  function useActionState<State, Payload = any>(
    action: (state: State, payload: Payload) => State | Promise<State>,
    initialState: State,
    permalink?: string
  ): [state: State, formAction: (payload: Payload) => void, isPending: boolean];

  function forwardRef<T, P = {}>(
    render: (props: P, ref: any) => ReactElement<any, any> | null
  ): ((props: P & RefAttributes<T>) => ReactElement<any, any> | null) & { displayName?: string };

  const Suspense: FC<{ fallback?: ReactNode; children?: ReactNode }>;
  const Fragment: FC<{ children?: ReactNode }>;
}

declare module 'react' {
  export = React;
}

declare module 'next/link' {
  import React from 'react';
  export interface LinkProps {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    [key: string]: any;
  }
  const Link: React.FC<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string, options?: { scroll?: boolean }): void;
    replace(href: string, options?: { scroll?: boolean }): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string | string[]>>(): T;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'lucide-react' {
  import React from 'react';

  export type LucideIcon = React.FC<{
    color?: string;
    size?: number | string;
    strokeWidth?: number | string;
    className?: string;
    [key: string]: any;
  }>;

  export const Handshake: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const Search: LucideIcon;
  export const MapPin: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const KeyRound: LucideIcon;
  export const CreditCard: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Wrench: LucideIcon;
  export const Star: LucideIcon;
  export const Loader2: LucideIcon;
  export const LoaderCircle: LucideIcon;
  export const Clock: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const XCircle: LucideIcon;
  export const X: LucideIcon;
  export const Menu: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Calendar: LucideIcon;
  export const User: LucideIcon;
  export const Lock: LucideIcon;
  export const Heart: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Camera: LucideIcon;
  export const Activity: LucideIcon;
  export const Check: LucideIcon;
  export const LogIn: LucideIcon;
  export const LogOut: LucideIcon;
  export const UserPlus: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Phone: LucideIcon;
  export const Info: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const Filter: LucideIcon;
  export const Plus: LucideIcon;
  export const Trash2: LucideIcon;
  export const Edit: LucideIcon;
  export const Edit3: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Building: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Power: LucideIcon;
  export const Inbox: LucideIcon;
  export const Package: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Maximize2: LucideIcon;
  export const ZoomIn: LucideIcon;
  export const ZoomOut: LucideIcon;
}

declare module 'next/image' {
  import React from 'react';
  const Image: React.FC<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    [key: string]: any;
  }>;
  export default Image;
}

declare module 'next' {
  export type NextConfig = {
    output?: 'standalone' | 'export';
    cacheComponents?: boolean;
    partialPrefetching?: boolean;
    turbopack?: Record<string, any>;
    [key: string]: any;
  };

  export type Metadata = {
    title?: string | { default: string; template?: string };
    description?: string;
    keywords?: string[];
    [key: string]: any;
  };

  export type Viewport = {
    colorScheme?: 'normal' | 'light' | 'dark' | 'light dark' | 'dark light';
    themeColor?: string | Array<{ media?: string; color: string }>;
    width?: string | number;
    initialScale?: number;
    maximumScale?: number;
    userScalable?: boolean;
    [key: string]: any;
  };
}

declare module 'next/font/google' {
  export function Geist(options?: any): { variable: string; className: string };
  export function Geist_Mono(options?: any): { variable: string; className: string };
}

declare module 'crypto' {
  export interface Hash {
    update(data: string | Buffer): this;
    digest(encoding?: string): string;
  }
  export function createHash(algorithm: string): Hash;
}
