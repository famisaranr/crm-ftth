import { z } from 'zod';

export const subscriberLoginSchema = z.object({
  account_number: z.string().min(1, 'Account number is required'),
  password: z.string().min(1, 'Password is required'),
});

export type SubscriberLoginDto = z.infer<typeof subscriberLoginSchema>;
