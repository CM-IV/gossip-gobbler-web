import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  BaseModel,
  computed,
  belongsTo,
  BelongsTo,
  hasOne,
  HasOne,
} from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Roles from '../enums/Role'
import Profile from './Profile'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public roleId: number

  @column()
  public email: string

  @column()
  public username: string

  @column({ serializeAs: null })
  public password: string

  @column()
  public rememberMeToken: string | null

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get isAdmin() {
    return this.roleId === Roles.ADMIN
  }

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @hasOne(() => Profile, {
    foreignKey: "user_id"
  })
  public profile: HasOne<typeof Profile>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }
}
