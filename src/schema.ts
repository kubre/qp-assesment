import { z } from "zod";

export const AddOrUpdateItem = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().min(0),
});

export type Item = z.infer<typeof AddOrUpdateItem> & { id: number };

