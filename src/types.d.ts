import Database from 'better-sqlite3';
import { Message } from 'telegraf/types';

type RecruitType = {
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

type GenericDbStatementType<T> = Database.Statement<Partial<T>, T | undefined>;
type GenericDbHookType<A, T> = (msg: A) => GenericDbStatementType<T>;

export type UserHookType = GenericDbHookType<Message, RecruitType>;
export type TableHookType = GenericDbHookType<string, RecruitType>;
export type MiscHookType = () => GenericDbStatementType<SqliteSequenceTableType>;
