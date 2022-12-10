import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Roles from '../../app/api/enums/Role'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema
      .raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
      .createTable(this.tableName, (table) => {
        table.uuid('id').primary().defaultTo(this.raw('uuid_generate_v4()'))
        table.integer('role_id').unsigned().references('id').inTable('roles').defaultTo(Roles.USER)
        table.string('username', 75).notNullable().unique()
        table.string('email', 255).notNullable().unique()
        table.string('password', 180).notNullable()
        table.boolean('is_email_verified').notNullable().defaultTo(false)

        /**
         * Uses timestampz for PostgreSQL and DATETIME2 for MSSQL
         */
        table.timestamp('created_at', { useTz: true }).notNullable()
        table.timestamp('updated_at', { useTz: true }).notNullable()
      })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
