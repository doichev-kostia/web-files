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
