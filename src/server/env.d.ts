import type { Env } from "./env.validator.js";

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Env {
			NODE_ENV: string;
		}
	}
}

export {};
