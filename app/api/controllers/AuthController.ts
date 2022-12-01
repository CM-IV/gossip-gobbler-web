import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from '../models/User'

export default class AuthController {
  public async register({ request, response, auth }: HttpContextContract) {
    const userSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.required(),
        rules.email(),
        rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
      ]),
      username: schema.string({ trim: false }, [
        rules.required(),
        rules.unique({ table: 'users', column: 'username', caseInsensitive: true }),
      ]),
      password: schema.string({ trim: false }, [
        rules.confirmed('passwordConfirmation'),
        rules.required(),
        rules.minLength(8),
      ]),
    })

    const payload = await request.validate({ schema: userSchema })
    const user = await User.create(payload)

    await auth.login(user)

    return response.redirect('/dashboard')
  }

  public async login({ request, response, session, auth }: HttpContextContract) {
    const { uid, password } = request.only(['uid', 'password'])

    try {
      await auth.use('web').attempt(uid, password)

      return response.redirect('/dashboard')
    } catch {
      session.flash('errors', {
        title: 'Username, email, or password is incorrect',
      })
      return response.redirect().back()
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()

    return response.redirect('/')
  }
}
