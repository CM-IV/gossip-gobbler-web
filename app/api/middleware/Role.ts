import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Roles from '../enums/Role'

export default class Role {
  public async handle(
    { response, auth, session }: HttpContextContract,
    next: () => Promise<void>,
    guards: string[]
  ) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    const roleIds = guards.map((guard) => Roles[guard.toUpperCase()])

    if (!roleIds.includes(auth.user?.roleId)) {
      session.flash('errors', {
        title: 'For page scrapes and data access, contact chuck@civdev.xyz for a customer plan!'
      })

      return response.redirect().back()
    }

    await next()
  }
}
