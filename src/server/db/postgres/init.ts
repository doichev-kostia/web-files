import {Kysely, PostgresDialect} from "kysely";
import pg from "pg";
import * as process from "node:process";

import {migrateToLatest} from "./migrator.js";

import {type FilesTable} from "./schema/files.js";

export interface Database {
	files: FilesTable
}

type Options = {
	runMigrations?: boolean
}

export const initDB = async ({runMigrations}: Options) => {
	const pool = new pg.Pool({
		connectionString: process.env.POSTGRES_CONNECTION_STRING
	});

	const dialect = new PostgresDialect({
		pool,
	});

	const db = new Kysely<Database>({
		dialect
	});

	if (runMigrations) {
		await migrateToLatest(db, {disconnect: false});
	}

	return db;
}

