import { NodePgTransaction } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';

export type DbTx = NodePgTransaction<typeof schema, any>;
