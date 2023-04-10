import {type FastifyReply} from "fastify";
import fs from "node:fs";
import {bytes} from "./constants.js";
import {pipeline} from "node:stream/promises";
import {createGzip} from "node:zlib";
import {logger} from "./logger.js";

export const readScript = async (filePath: string, reply: FastifyReply): Promise<void> => {
	const abortController = new AbortController();
	const stream = fs.createReadStream(filePath, {
		encoding: 'utf-8',
		highWaterMark: 50 * bytes.megabyte,
	})
	reply.raw.on('close', () => {
		abortController.abort();
	})

	reply.header('Content-Encoding', 'gzip');
	reply.header('Content-Type', 'application/octet-stream')


	try {
		await pipeline(
			stream,
			createGzip({
				chunkSize: 50 * bytes.megabyte,
				level: 9, // gzip has compression levels 1-9, where 9 gives us maximum compression but at the slowest speed. The default compression level is 6 and is a good compromise between speed and compression ratio
			}),
			reply.raw,
			{signal: abortController.signal}
		)
	} catch (error: unknown) {
		logger.error(error)
		if (error instanceof Error && error.name !== 'AbortError') {
			reply.send(error)
		}
	}
}


