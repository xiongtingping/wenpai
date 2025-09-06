declare module '@authing/guard/dist/esm/guard.min.js' {
  export class Guard {
    constructor(options: any);
    start(el?: string | HTMLElement, visible?: boolean): Promise<any>;
    show(): void;
    hide(): void;
    on(evt: string, handler: (...args: any[]) => void): void;
    emit?(evt: string, payload?: any): void;
  }
  export default Guard;
}
