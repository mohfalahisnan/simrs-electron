import z from 'zod'
import { Encounter, EncounterSchema, EncounterSchemaWithId } from '../../models/encounter'
import { Patient } from '../../models/patient'

export const requireSession = true

export const schemas = {
  list: {
    args: z
      .object({
        q: z.string().optional()
      })
      .optional(),
    result: z.object({
      success: z.boolean(),
      data: EncounterSchemaWithId.extend({
        patient: z
          .object({
            id: z.number(),
            kode: z.string().optional(),
            name: z.string()
          })
          .optional()
      })
        .array()
        .optional(),
      error: z.string().optional()
    })
  },
  getById: {
    args: z.object({ id: z.number() }),
    result: z.object({
      success: z.boolean(),
      data: EncounterSchemaWithId.extend({
        patient: z
          .object({
            id: z.number(),
            kode: z.string().optional(),
            name: z.string()
          })
          .optional()
      }).optional(),
      error: z.string().optional()
    })
  },
  create: {
    args: EncounterSchema,
    result: z.object({
      success: z.boolean(),
      data: EncounterSchemaWithId.optional(),
      error: z.string().optional()
    })
  },
  update: {
    args: EncounterSchemaWithId,
    result: z.object({
      success: z.boolean(),
      data: EncounterSchemaWithId.optional(),
      error: z.string().optional()
    })
  },
  deleteById: {
    args: z.object({ id: z.number() }),
    result: z.object({ success: z.boolean(), error: z.string().optional() })
  }
} as const

export const list = async (_ctx, _args?: z.infer<typeof schemas.list.args>) => {
  try {
    await Encounter.sync({ alter: true })
    const where = {}
    const include = [{ model: Patient, as: 'patient', attributes: ['id', 'kode', 'name'] }]
    const items = await Encounter.findAll({ where, include, order: [['visitDate', 'DESC']] })
    return { success: true, data: items.map((e) => e.toJSON() as any) }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to list encounters' }
  }
}

export const getById = async (_ctx, args: z.infer<typeof schemas.getById.args>) => {
  try {
    await Encounter.sync({ alter: true })
    const item = await Encounter.findByPk(args.id, {
      include: [{ model: Patient, as: 'patient', attributes: ['id', 'kode', 'name'] }]
    })
    return { success: true, data: item?.toJSON() as any }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get encounter' }
  }
}

export const create = async (_ctx, args: z.infer<typeof schemas.create.args>) => {
  try {
    await Encounter.sync({ alter: true })
    const result = await Encounter.create({
      patientId: Number(args.patientId),
      visitDate: args.visitDate instanceof Date ? args.visitDate : new Date(args.visitDate),
      serviceType: args.serviceType,
      reason: args.reason ?? null,
      note: args.note ?? null,
      status: args.status,
      resourceType: 'Encounter',
      period:
        args.period ??
        ({
          start:
            (args.visitDate instanceof Date ? args.visitDate.toISOString() : String(args.visitDate)) ||
            undefined
        } as any),
      subject: { reference: `Patient/${Number(args.patientId)}` },
      createdBy: args.createdBy ?? null
    })
    const created = await Encounter.findByPk(result.getDataValue('id'), {
      include: [{ model: Patient, as: 'patient', attributes: ['id', 'kode', 'name'] }]
    })
    return { success: true, data: created?.toJSON() as any }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create encounter' }
  }
}

export const update = async (_ctx, args: z.infer<typeof schemas.update.args>) => {
  try {
    await Encounter.sync({ alter: true })
    const e = await Encounter.findByPk(args.id)
    if (!e) return { success: false, error: 'Encounter not found' }
    await e.update({
      patientId: args.patientId,
      visitDate: args.visitDate instanceof Date ? args.visitDate : new Date(args.visitDate),
      serviceType: args.serviceType,
      reason: args.reason ?? null,
      note: args.note ?? null,
      status: args.status,
      period:
        args.period ??
        ({
          start:
            (args.visitDate instanceof Date ? args.visitDate.toISOString() : String(args.visitDate)) ||
            undefined
        } as any),
      subject: { reference: `Patient/${Number(args.patientId)}` },
      updatedBy: args.updatedBy ?? null
    })
    const updated = await Encounter.findByPk(args.id, {
      include: [{ model: Patient, as: 'patient', attributes: ['id', 'kode', 'name'] }]
    })
    return { success: true, data: updated?.toJSON() as any }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update encounter' }
  }
}

export const deleteById = async (_ctx, args: z.infer<typeof schemas.deleteById.args>) => {
  try {
    const e = await Encounter.findByPk(args.id)
    if (!e) return { success: false, error: 'Encounter not found' }
    await e.destroy()
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete encounter' }
  }
}
