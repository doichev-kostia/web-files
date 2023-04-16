import {z} from "zod";

export const EnvValidator = z.object({
	NODE_ENV: z.string(),
	PORT: z.string().refine((val) => !Number.isNaN(Number(val))).default('8080'),
	POSTGRES_CONNECTION_STRING: z.string(),
});

export type Env = z.infer<typeof EnvValidator>;
