import { prisma } from "@/lib/prisma-client";
import { Prisma } from "@/generated/prisma";
import { logger } from "@/lib/monitoring";

export const AUDIT_ACTIONS = {
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  USER_BANNED: "USER_BANNED",
  USER_UNBANNED: "USER_UNBANNED",
  COURSE_CREATED: "COURSE_CREATED",
  COURSE_UPDATED: "COURSE_UPDATED",
  COURSE_DELETED: "COURSE_DELETED",
  COURSE_SUBMITTED: "COURSE_SUBMITTED",
  COURSE_APPROVED: "COURSE_APPROVED",
  COURSE_REJECTED: "COURSE_REJECTED",
  INSTRUCTOR_PROMOTED: "INSTRUCTOR_PROMOTED",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

interface CreateAuditLogParams {
  actorId: string;
  action: AuditAction | string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Record an admin/moderator action to the AuditLog table.
 * Never throws — failures are logged but do not interrupt the caller.
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetId: params.targetId,
        targetType: params.targetType ?? null,
        metadata: params.metadata ?? Prisma.JsonNull,
      },
    });
  } catch (err) {
    logger.error(
      `Failed to write audit log [${params.action}]`,
      "auditLog",
      undefined,
      err
    );
  }
}
