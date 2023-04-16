import { parse } from 'dotenv';
import * as fs from 'node:fs';
import * as process from 'node:process';
import path from 'node:path';
import { z } from 'zod';
import {EnvValidator} from "./env.validator.js";

const lookupFile = (dir: string, file: string): string | undefined => {
	const fullPath = path.join(dir, file);
	if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
		return fullPath;
	}
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
export const loadEnv = () => {
	const mode = process.env.NODE_ENV;
	const envDir = process.cwd();
	const envFiles = [
		/** default file */ `.env`,
		/** local file */ `.env.local`,
		/** mode file */ `.env.${mode}`,
		/** mode local file */ `.env.${mode}.local`,
	];
	const parsed = Object.fromEntries(
		envFiles.flatMap((file) => {
			const path = lookupFile(envDir, file);
			if (!path) return [];
			return Object.entries(parse(fs.readFileSync(path)));
		})
	);

	Object.keys(parsed).forEach((key) => {
		if (process.env[key] === undefined) {
			process.env[key] = parsed[key];
		}
	});

	const result = EnvValidator.safeParse(process.env);
	if (!result.success) {
		console.error('Invalid environment variables', result.error.flatten().fieldErrors);
		throw new Error('Invalid environment variables');
	}
};
