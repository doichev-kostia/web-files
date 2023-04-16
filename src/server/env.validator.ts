import {z} from "zod";

export const EnvValidator = z.object({
	NODE_ENV: z.string(),
	PORT: z.string().refine((val) => !Number.isNaN(Number(val))).default('8080'),
});

export type Env = z.infer<typeof EnvValidator>;
