import {FileMigrationProvider, type Kysely, Migrator} from "kysely";
import { promises as fs } from 'node:fs'
import * as path from 'node:path'

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const migrations = path.join(__dirname, 'migrations')

function initMigrator (db: Kysely<any>) {
	return new Migrator({
		db,
		provider: new FileMigrationProvider({
			fs,
			path,
			migrationFolder: migrations,
		})
	});
}

type Options = {
	disconnect?: boolean
}

export async function migrateToLatest(db: Kysely<any>, options?: Options ) {
	const { disconnect = true } = options ?? {}
	const migrator = initMigrator(db);
	const {results, error} = await migrator.migrateToLatest();

	results?.forEach((it) => {
		if (it.status === 'Success') {
			console.log(`migration "${it.migrationName}" was executed successfully`)
		} else if (it.status === 'Error') {
			console.error(`failed to execute migration "${it.migrationName}"`)
		}
	})

	if (error) {
		console.error('failed to migrate')
		console.error(error)
		process.exit(1)
	}

	if (disconnect) {
		await db.destroy()
	}
}
