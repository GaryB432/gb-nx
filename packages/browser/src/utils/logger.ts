interface GBConsole {
  clear(): void;
  // count(label?: string): void;
  // countReset(label?: string): void;
  debug(...data: unknown[]): void;
  // dir(item?: any, options?: any): void;
  // dirxml(...data: any[]): void;
  error(...data: unknown[]): void;
  // group(...data: any[]): void;
  // groupCollapsed(...data: any[]): void;
  // groupEnd(): void;
  info(...data: unknown[]): void;
  log(...data: unknown[]): void;
  // table(tabularData?: any, properties?: string[]): void;
  // time(label?: string): void;
  // timeEnd(label?: string): void;
  // timeLog(label?: string, ...data: any[]): void;
  // timeStamp(label?: string): void;
  // trace(...data: any[]): void;
  warn(...data: unknown[]): void;
}

interface Message {
  text: string;
  type: 'debug' | 'warn' | 'log' | 'error' | 'info';
}

export class Logger implements GBConsole {
  private messages: Message[] = [];
  public clear(): void {
    this.messages = [];
  }
  public debug(...data: string[]): void {
    this.messages.push({ type: 'debug', text: data.join('#') });
  }
  public error(...data: string[]): void {
    this.messages.push({ type: 'error', text: data.join('#') });
  }
  public flush(): void {
    console.log(this.getStrings().join('\n'));
    this.clear();
  }
  public info(...data: string[]): void {
    this.messages.push({ type: 'info', text: data.join('#') });
  }
  public log(...data: string[]): void {
    this.messages.push({ type: 'log', text: data.join('#') });
  }
  public warn(...data: string[]): void {
    this.messages.push({ type: 'warn', text: data.join('#') });
  }
  private getStrings(): string[] {
    return this.messages.map((m) => `${m.type} ${m.text}`);
  }
}
