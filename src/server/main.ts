import {fastify} from "fastify";
import {z} from "zod";
import * as process from "node:process";
import * as path from "node:path";
import * as fs from "node:fs";
import {randomUUID} from "node:crypto"
import sharp from "sharp";
import {readScript} from "./readScript.js";
import {logger} from "./logger.js";
import {bytes} from "./constants.js";
import {escapeDirectoryTraversal, isImage, removeExtensionDot} from "./utils.js";
import {
	FileGetterParamsValidator,
	FileGetterQueryValidator,
	FileParamsValidator,
	FileTypeValidator, FileUploadQueryValidator,
	imageFormat
} from "./contracts.js";
import {pipeline} from "node:stream/promises";
import {loadEnv} from "./loadEnv.js";
import {type Database, initDB} from "./db/postgres/init.js";
import {type Kysely} from "kysely";

loadEnv();

const app = fastify({
	logger: true,
});

app.register(import('@fastify/sensible'));
app.register(import('@fastify/cors'), {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
})

app.register(import('@fastify/multipart'))

const db = await initDB({runMigrations: true})

declare module 'fastify' {
	export interface FastifyRequest {
		db: Kysely<Database>
	}
}
app.addHook('onRequest', (request, reply, done) => {
	request.db = db
	done()
})

const filePathMap: Record<z.infer<typeof FileTypeValidator>, string> = {
	sql: './bucket/script.sql',
	video: './bucket/video.mp4',
	audio: './bucket/audio.mp3',
	binary: './bucket/binary.bin'
}


app.get<{
	Params: z.infer<typeof FileParamsValidator>
}>('/files/:type', async (request, reply) => {
	const {type} = FileParamsValidator.parse(request.params);
	const filePath = path.resolve(filePathMap[type]);
	if (type === "sql") {
		await readScript(filePath, reply);
	} else {
		reply.status(400).send({
			message: 'Not implemented'
		})
	}
})


app.post<{
	Querystring: z.infer<typeof FileUploadQueryValidator>
}>('/files/upload', async (request, reply) => {
	const {storage, dbProvider} = FileUploadQueryValidator.parse(request.query);
	const abortController = new AbortController();

	reply.header('Content-Type', 'application/json')
	request.raw.on('close', () => {
		abortController.abort();
	})

	try {
		const file = await request.file({
			highWaterMark: 10 * bytes.megabyte
		})
		if (!file?.filename) {
			throw new Error('File should have name')
		}


		if (storage === 'db') {
			const content = file.file.read();
			const {id} = await db.insertInto('files')
				.values({
					content,
				})
				.returning('id')
				.executeTakeFirstOrThrow()

			reply.send({
				url: `http://localhost:8080/assets/${id}`
			})
			return;
		}

		let extension = removeExtensionDot(path.extname(file.filename))


		const basename = path.basename(file.filename, `.${extension}`)
		if (extension === 'jpeg') {
			extension = 'jpg'
		}
		const fileName = `${basename}-${randomUUID()}.${extension}`

		const writeStream = fs.createWriteStream(path.resolve('./', escapeDirectoryTraversal('./bucket/images', fileName)), {
			highWaterMark: 10 * bytes.megabyte,
		})

		const streams: any[] = [file.file];

		if (isImage(extension)) {
			streams.push(
				sharp().toFormat(extension, {
					compressionLevel: 9,
					palette: true,
					mozjpeg: true,
					mixed: true,
				})
			)
		}

		streams.push(
			writeStream,
			{signal: abortController.signal}
		)


		await pipeline(
			// @ts-ignore
			...streams
		)

		reply.send({
			url: `http://localhost:8080/assets/images/${fileName}`
		})
	} catch (error) {
		reply.send(error)
	}
})


app.get<{
	Params: z.infer<typeof FileGetterParamsValidator>,
	Querystring: z.infer<typeof FileGetterQueryValidator>
}>('/assets/images/:fileName', async function getImage(request, reply) {
	const {fileName} = FileGetterParamsValidator.parse(request.params);
	const {w, h, ext} = FileGetterQueryValidator.parse(request.query);

	const filePath = path.resolve(escapeDirectoryTraversal('./bucket/images', fileName));
	const file = await fs.createReadStream(filePath, {
		highWaterMark: bytes.megabyte,
	});

	const extension = imageFormat.parse(removeExtensionDot(path.extname(filePath)));
	const targetExtension = ext ?? extension;

	const transformer = sharp()

	if (w || h) {
		transformer.resize(Number(w) || null, Number(h) || null)
	}

	if (targetExtension !== extension) {
		transformer.toFormat(targetExtension, {
			compressionLevel: 9,
			palette: true,
			mozjpeg: true,
			mixed: true,
		})
	}

	reply.header('Content-Type', `image/${targetExtension}`);
	await pipeline(
		file,
		transformer,
		reply.raw
	)
	;
})

app.get('/performance/end', () => {
	process.exit(0);
})

app.listen({
	port: Number(process.env.PORT)
}, (error, address) => {
	if (error) {
		logger.error(error);
		process.exit(1);
	}
	logger.info(`Server listening at ${address}`);
})


