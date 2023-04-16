import {type Kysely, sql} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db)

	await db.schema
		.createTable('files')
		.addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`uuid_generate_v4()`))
		.addColumn('path', 'text')
		// @ts-ignore
		.addColumn('content', 'bytea')
		.execute()

}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('files').execute()
}
