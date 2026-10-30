import mongoose from 'mongoose';
import { randomUUID, createHash } from 'node:crypto';

const leadModelSchema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  name: { type: String, required: true, maxlength: 100 },
  phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
  city: { type: String, required: true }, service: { type: String, required: true },
  plan: { type: String, maxlength: 80, default: '' }, page: { type: String, maxlength: 180 },
  consent: { type: Boolean, required: true }, consentAt: { type: Date, required: true },
  attribution: { source: String, medium: String, campaign: String },
  requestKey: { type: String, required: true },
  fingerprint: { type: String, required: true, index: true },
  dedupeBucket: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  webhook: { state: { type: String, enum: ['disabled', 'pending', 'sent', 'failed'], default: 'disabled' }, attemptedAt: Date },
}, { timestamps: true, strict: 'throw', versionKey: false, bufferCommands: false });
leadModelSchema.index({ requestKey: 1 }, { unique: true });
leadModelSchema.index({ fingerprint: 1, dedupeBucket: 1 }, { unique: true });
leadModelSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadModelSchema);
const TEN_MINUTES = 10 * 60 * 1000;

export function fingerprintLead(lead) {
  return createHash('sha256').update([lead.phone, lead.service, lead.plan, lead.page].join('\u0000')).digest('hex');
}

export function createMongoLeadRepository({ webhookEnabled = false } = {}) {
  return {
    isReady: () => mongoose.connection.readyState === 1,
    async save(lead, idempotencyKey) {
      if (mongoose.connection.readyState !== 1) throw new Error('Database unavailable');
      await Lead.init();
      const now = new Date();
      const fingerprint = fingerprintLead(lead);
      const requestKey = idempotencyKey ? createHash('sha256').update(idempotencyKey).digest('hex') : randomUUID();
      // Exact request keys are valid only for this same contact/service/plan/page.
      const byKey = await Lead.findOne({ requestKey }).lean();
      if (byKey) {
        if (byKey.fingerprint !== fingerprint) return { conflict: true };
        return { leadId: byKey.publicId, duplicate: true };
      }
      const recent = await Lead.findOne({ fingerprint, createdAt: { $gte: new Date(now.getTime() - TEN_MINUTES) } }).lean();
      if (recent) return { leadId: recent.publicId, duplicate: true };
      const expiresAt = new Date(now); expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 24);
      const { website, ...safeLead } = lead;
      try {
        const saved = await Lead.create({ ...safeLead, publicId: randomUUID(), fingerprint,
          requestKey, dedupeBucket: Math.floor(now.getTime() / TEN_MINUTES), consentAt: now,
          expiresAt, webhook: { state: webhookEnabled ? 'pending' : 'disabled' } });
        return { leadId: saved.publicId, duplicate: false };
      } catch (error) {
        if (error.code !== 11000) throw error;
        const existing = await Lead.findOne({ $or: [{ requestKey }, { fingerprint, dedupeBucket: Math.floor(now.getTime() / TEN_MINUTES) }] }).lean();
        if (!existing || existing.fingerprint !== fingerprint) return { conflict: true };
        return { leadId: existing.publicId, duplicate: true };
      }
    },
    async markWebhook(leadId, state) {
      await Lead.updateOne({ publicId: leadId }, { $set: { 'webhook.state': state, 'webhook.attemptedAt': new Date() } });
    },
  };
}
