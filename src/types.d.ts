import Database from 'better-sqlite3';
import { Message } from 'telegraf/types';

type ChatterType = {
  id: number;
  user_id: string;
  name: string;
  count: number;
  won_date: string;
};

type SqliteSequenceTableType = {
  name: string;
  seq: number;
};

type GenericDbStatementType<T> = Database.Statement<Partial<T>, T>;
type GenericDbHookType<A, T> = (msg: A) => GenericDbStatementType<T>;

export type ChatterHookType = GenericDbHookType<Message, ChatterType>;
export type TableHookType = GenericDbHookType<string, ChatterType>;
export type MiscHookType = () => GenericDbStatementType<SqliteSequenceTableType>;
