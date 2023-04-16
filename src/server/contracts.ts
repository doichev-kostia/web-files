import {z} from "zod";

export const imageFormat = z.enum(['jpg', 'png', 'webp', 'avif']);

export const FileTypeValidator = z.enum(['sql', 'video', 'audio', 'binary']);

export const FileParamsValidator = z.object({
	type: FileTypeValidator
});

export const FileGetterParamsValidator = z.object({
	fileName: z.string().min(4).refine(value => value.includes('.'), {
		message: 'file name must contain the extension'
	})
})

export const FileGetterQueryValidator = z.object({
	w: z.string().optional(),
	h: z.string().optional(),
	ext: imageFormat.optional(),
})

export const FileStorageValidator = z.enum(['db', 'fs']);
export const DBProviderValidator = z.enum(['postgres', 'mongo']);
export const FileUploadQueryValidator = z.object({
	storage: FileStorageValidator,
	dbProvider: DBProviderValidator.optional()
})
	.refine(value => value.storage === 'db' ? value.dbProvider !== undefined : true, {
		message: 'dbProvider is required when storage is db'
	})

export const GetFileQueryValidator = z.object({
	dbProvider: DBProviderValidator
});

export const GetFileParamsValidator = z.object({
	fileId: z.string()
})
