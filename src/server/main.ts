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
import {imageFormat} from "./contracts.js";
import {pipeline} from "node:stream/promises";

const app = fastify({
	logger: true,
});

app.register(import('@fastify/sensible'));
app.register(import('@fastify/cors'), {
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
})
app.register(import('@fastify/multipart'))

// ✅ GET /files/sql - read a huge file from disk, send it via node streams to the client and gzip it on the fly
// POST /files/upload - optimize the image and save it to disk
// GET /files/binary
// GET /files/video
// GET /files/audio

const FileTypeValidator = z.enum(['sql', 'video', 'audio', 'binary']);

const FileParamsValidator = z.object({
	type: FileTypeValidator
});

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
		reply.send({
			message: 'Not implemented'
		})
	}
})

app.post('/files/upload', async (request, reply) => {
	reply.header('Content-Type', 'application/json')
	reply.send({
		url: 'http://localhost:8080/assets/resized.jpg'
	})
})

app.post('/files/avatar/upload', async (request, reply) => {
	reply.header('Content-Type', 'application/json')
	const abortController = new AbortController();
	request.raw.on('close', () => {
		abortController.abort();
	})
	try {
		const file = await request.file({
			highWaterMark: 10 * bytes.megabyte,
			limits: {fileSize: 2 * bytes.megabyte}
		})
		if (!file?.filename) {
			throw new Error('File should have name')
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

const FileGetterParamsValidator = z.object({
	fileName: z.string().min(4).refine(value => value.includes('.'), {
		message: 'file name must contain the extension'
	})
})


const FileGetterQueryValidator = z.object({
	w: z.number().min(1).max(10_000).optional(),
	h: z.number().min(1).max(10_000).optional(),
	ext: imageFormat.optional(),
})
app.get<{
	Params: z.infer<typeof FileGetterParamsValidator>,
	Querystring: z.infer<typeof FileGetterQueryValidator>
}>('/assets/images/:fileName', async (request, reply) => {
	const {fileName} = FileGetterParamsValidator.parse(request.params);
	const {w, h, ext} = FileGetterQueryValidator.parse(request.query);

	const filePath = path.resolve(escapeDirectoryTraversal('./bucket/images', fileName));
	const file = await fs.promises.readFile(filePath);

	const extension = imageFormat.parse(removeExtensionDot(path.extname(filePath)));
	const targetExtension = ext ?? extension;

	const transformer = sharp(file)

	if (w || h) {
		transformer.resize(w, h)
	}

	if (targetExtension !== extension) {
		transformer.toFormat(targetExtension)
	}


	const buffer = await transformer.toBuffer();

	reply.header('Content-Type', `image/${targetExtension}`);
	reply.send(buffer);

})

app.listen({
	port: 8080
}, (error, address) => {
	if (error) {
		logger.error(error);
		process.exit(1);
	}
	logger.info(`Server listening at ${address}`);
})


