import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Roles from '../enums/Role'

export default class Role {
  public async handle({ response, auth }: HttpContextContract, next: () => Promise<void>, guards: string[]) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    const roleIds = guards.map((guard) => Roles[guard.toUpperCase()])

    if (!roleIds.includes(auth.user?.roleId)) {
      return response.unauthorized({ error: `This is restricted to ${guards.join(', ')} users` })
    }

    await next()
  }
}
