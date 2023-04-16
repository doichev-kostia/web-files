import {Kysely, PostgresDialect} from "kysely";
import {Pool} from "pg";

import {migrateToLatest} from "./migrator.js";

import {type FilesTable} from "./schema/files.js";

interface Database {
	files: FilesTable
}

type Options = {
	runMigrations?: boolean
}

export const initDB = async ({runMigrations}: Options) => {
	 const db = new Kysely<Database>({
		// Use MysqlDialect for MySQL and SqliteDialect for SQLite.
		dialect: new PostgresDialect({
			pool: new Pool({
				host: 'localhost',
				database: 'postgres',
			})
		})
	});

	 if (runMigrations) {
		 await migrateToLatest(db);
	 }
}

