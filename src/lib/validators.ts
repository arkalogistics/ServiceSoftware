import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().optional(),
});

export const kycPartySchema = z.object({
  projectId: z.string().cuid(),
  role: z.enum(["client", "provider", "company"]),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  rfc: z.string().optional(),
  address: z.string().optional(),
  isCompany: z.boolean().optional(),
  idFrontPath: z.string().optional(),
  idBackPath: z.string().optional(),
  proofPath: z.string().optional(),
  signatureDataUrl: z.string().optional(),
});

export const documentSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(1),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  totalHours: z.number().int().nonnegative().optional(),
  comments: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
});
