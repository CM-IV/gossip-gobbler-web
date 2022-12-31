import { DateTime } from 'luxon'
import { column } from '@ioc:Adonis/Lucid/Orm'
import AppBaseModel from './AppBaseModel'

export default class Authenticator extends AppBaseModel {
  @column({ isPrimary: true })
  public credentialID: string

  @column()
  public credentialPublicKey: Buffer

  @column()
  public counter: number

  @column()
  public credentialDeviceType: string

  @column()
  public credentialBackedUp: boolean

  @column()
  public transports: string[] | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
