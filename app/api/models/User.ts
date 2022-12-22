import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import {
  column,
  beforeSave,
  computed,
  belongsTo,
  BelongsTo,
  hasOne,
  HasOne,
  hasMany,
  HasMany,
} from '@ioc:Adonis/Lucid/Orm'
import Role from './Role'
import Roles from '../enums/Role'
import Profile from './Profile'
import Token from './Token'
import VerifyEmail from '../../Mailers/VerifyEmail'
import AppBaseModel from './AppBaseModel'

export default class User extends AppBaseModel {
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

  @column()
  public isEmailVerified: boolean = false

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get isAdmin() {
    return this.roleId === Roles.ADMIN
  }

  @computed()
  public get isCustomer() {
    return this.roleId === Roles.CUSTOMER
  }

  @belongsTo(() => Role)
  public role: BelongsTo<typeof Role>

  @hasMany(() => Token)
  public tokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: query => query.where('type', "PASSWORD_RESET")
  })
  public passwordResetTokens: HasMany<typeof Token>

  @hasMany(() => Token, {
    onQuery: query => query.where('type', "VERIFY_EMAIL")
  })
  public verifyEmailTokens: HasMany<typeof Token>

  @hasOne(() => Profile, {
    foreignKey: 'userId',
  })
  public profile: HasOne<typeof Profile>

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }

  public async sendVerifyEmail() {
    const token = await Token.generateVerifyEmailToken(this)
    await new VerifyEmail(this, token).sendLater()
  }
}
