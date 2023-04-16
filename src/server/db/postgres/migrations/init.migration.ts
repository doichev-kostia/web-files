import { type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('files')
		.addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo('uuid_generate_v4()'))
		.addColumn('path', 'text')
		.addColumn('content', 'binary')
		.execute()

}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('files').execute()
}
