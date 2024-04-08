import { z } from "zod";

export const AddOrUpdateItem = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    quantity: z.number().min(0),
});

export type Item = z.infer<typeof AddOrUpdateItem> & { id: number, createdAt: string };

export const OrderItem = z.object({
    itemId: z.number().min(1),
    quantity: z.number().min(1),
});
export const AddOrder = z.object({
    items: z.array(OrderItem),
});

export type Order = {
    id: number;
    userId: number;
    itemId: number;
    quantity: number;
    createdAt: string;
};

