import {fastify} from "fastify";
import {z} from "zod";
import * as process from "node:process";
import * as path from "node:path";
import {readScript} from "./readScript.js";
import {logger} from "./logger.js";

const app = fastify({
	logger: true
});

app.register(import('@fastify/sensible'));

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
	console.log(request.body);
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


