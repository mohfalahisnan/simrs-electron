import z from 'zod'
import { Patient, PatientSchema, PatientSchemaWithId } from '../../models/patient'

export const requireSession = true

export const schemas = {
  list: {
    result: z.object({
      success: z.boolean(),
      data: PatientSchemaWithId.array().optional(),
      error: z.string().optional()
    })
  },
  getById: {
    args: z.object({ id: z.number() }),
    result: z.object({
      success: z.boolean(),
      data: PatientSchemaWithId.optional(),
      error: z.string().optional()
    })
  },
  create: {
    args: PatientSchema.partial(),
    result: z.object({
      success: z.boolean(),
      data: PatientSchemaWithId.optional(),
      error: z.string().optional()
    })
  },
  update: {
    args: PatientSchemaWithId,
    result: z.object({
      success: z.boolean(),
      data: PatientSchemaWithId.optional(),
      error: z.string().optional()
    })
  },
  deleteById: {
    args: z.object({ id: z.number() }),
    result: z.object({ success: z.boolean(), error: z.string().optional() })
  }
} as const

export const list = async () => {
  try {
    await Patient.sync()
    const items = await Patient.findAll({ order: [['id', 'DESC']] })
    return { success: true, data: items }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get patient list' }
  }
}

export const getById = async (_ctx, args: z.infer<typeof schemas.getById.args>) => {
  try {
    const item = await Patient.findByPk(args.id)
    return { success: true, data: item?.toJSON() as any }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to get patient' }
  }
}

export const create = async (_ctx, args: z.infer<typeof schemas.create.args>) => {
  try {
    await Patient.sync()
    const result = await Patient.create({
      active: args.active ?? true,
      identifier: args.identifier ?? null,
      kode: String(args.kode),
      name: String(args.name),
      gender: String(args.gender) as 'male' | 'female',
      birthDate: args.birthDate instanceof Date ? args.birthDate : new Date(args.birthDate || ''),
      placeOfBirth: args.placeOfBirth ?? null,
      phone: args.phone ?? null,
      email: args.email ?? null,
      addressLine: args.addressLine ?? null,
      province: args.province ?? null,
      city: args.city ?? null,
      district: args.district ?? null,
      village: args.village ?? null,
      postalCode: args.postalCode ?? null,
      country: args.country ?? null,
      maritalStatus: String(args.maritalStatus) as 'single' | 'married' | 'divorced' | 'widowed',
      createdBy: args.createdBy ?? null
    })
    return { success: true, data: result.toJSON() as any }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create patient' }
  }
}

export const update = async (_ctx, args: z.infer<typeof schemas.update.args>) => {
  try {
    const p = await Patient.findByPk(args.id)
    if (!p) return { success: false, error: 'Patient not found' }

    await p.update({
      active: args.active,
      identifier: args.identifier,
      kode: args.kode,
      name: args.name,
      gender: args.gender,
      birthDate: args.birthDate instanceof Date ? args.birthDate : new Date(args.birthDate || ''),
      placeOfBirth: args.placeOfBirth,
      phone: args.phone,
      email: args.email,
      addressLine: args.addressLine,
      province: args.province,
      city: args.city,
      district: args.district,
      village: args.village,
      postalCode: args.postalCode,
      country: args.country,
      maritalStatus: args.maritalStatus,
      updatedBy: args.updatedBy ?? null
    })

    const updated = await Patient.findByPk(args.id)
    return { success: true, data: updated?.toJSON() as any }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update patient' }
  }
}

export const deleteById = async (_ctx, args: z.infer<typeof schemas.deleteById.args>) => {
  try {
    const p = await Patient.findByPk(args.id)
    if (!p) return { success: false, error: 'Patient not found' }
    await p.destroy()
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete patient' }
  }
}
