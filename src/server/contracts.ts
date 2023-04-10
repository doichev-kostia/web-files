import {z} from "zod";

export const imageFormat = z.enum(['jpg', 'png', 'webp', 'avif']);
