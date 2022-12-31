import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'authenticators'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('credential_id').primary().references('users.id').onDelete('CASCADE')
      table.binary('credential_public_key').notNullable()
      table.bigInteger('counter').notNullable()
      table.string('credential_device_type', 32).notNullable()
      table.boolean('credential_backed_up').notNullable()
      table.string('transports', 255).nullable()
      table.index(['credential_id'])

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
