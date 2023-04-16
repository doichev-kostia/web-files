import {Generated} from "kysely"

export interface FilesTable {
	id: Generated<string>,
	path: string | null,
	content: Uint8Array | null,
}
