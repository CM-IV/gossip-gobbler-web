import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class Guest {
  public async handle({ auth, response }: HttpContextContract, next: () => Promise<void>) {
    // code for middleware goes here. ABOVE THE NEXT CALL

    if (auth.use('web').isLoggedIn) {
      response.redirect().back()
    }

    await next()
  }
}
