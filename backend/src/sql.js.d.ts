declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string, params?: any[]): QueryExecResult[];
    export(): Uint8Array;
    close(): void;
    prepare(sql: string): Statement;
  }

  export interface Statement {
    run(params?: any[]): void;
    free(): void;
  }

  export interface QueryExecResult {
    columns: string[];
    values: any[][];
  }

  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
}
