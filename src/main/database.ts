import { app } from 'electron'
import path from 'path'
import { Sequelize } from 'sequelize'

const dbPath = path.join(app.getPath('userData'), 'locals.db')

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false
})

export async function initDatabase() {
  await sequelize.sync({ alter: true })
  console.log('Database ready')
}
