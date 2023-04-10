import * as path from 'node:path';
import {imageFormat} from "./contracts.js";
import {z} from "zod";
export const removeExtensionDot = (ext: string) => {
	return ext.startsWith('.') ? ext.slice(1) : ext;
};

export const escapeDirectoryTraversal = (basePath: string, unsafeSuffix: string) => {
	const safeSuffix = path.normalize(unsafeSuffix).replace(/^(\.\.(\/|\\|$))+/, '');
	return path.join(basePath, safeSuffix);
}

export const isImage = (extension: string): extension is z.infer<typeof imageFormat> => {
	const ext = removeExtensionDot(extension);
	return imageFormat.safeParse(ext).success;
}
