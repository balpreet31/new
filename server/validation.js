import { z } from 'zod';

export const SERVICES = Object.freeze([
  'Private Limited Company Registration', 'LLP Registration',
  'One Person Company Registration', 'Public Limited Company Registration',
  'Partnership Firm Registration', 'Company Annual Filing', 'LLP Annual Filing',
  'ISIN & Shares Dematerialization', 'Company Strike Off', 'Event Based Compliance',
]);
export const CITIES = Object.freeze(['Noida', 'Ghaziabad', 'Delhi', 'Greater Noida', 'Other']);

export function normalizePhone(input) {
  if (typeof input !== 'string' || !/^[+\d\s().-]+$/.test(input)) return input;
  let digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

const safeText = z.string().trim().refine(value => !/[<>\u0000-\u001f\u007f]/u.test(value), 'Please use plain text.');
const attributionSchema = z.object({
  source: safeText.max(120).optional(), medium: safeText.max(120).optional(),
  campaign: safeText.max(160).optional(),
}).strict();

export const leadSchema = z.object({
  name: safeText.min(2, 'Please enter your full name.').max(100),
  phone: z.preprocess(normalizePhone, z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number.')),
  city: z.enum(CITIES), service: z.enum(SERVICES),
  plan: safeText.max(80).default(''),
  page: z.string().max(180).regex(/^\/(?:[a-z0-9-]+\.html)?$/, 'Invalid page reference.').default('/'),
  website: z.string().max(200).optional().default(''),
  consent: z.literal(true), attribution: attributionSchema.optional(),
}).strict();

export const idempotencySchema = z.string().uuid();
