import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from '../models/User'

export default class AuthController {
  public async register({ request, response, session }: HttpContextContract) {
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

    const { email, username, password } = await request.validate({ 
      schema: userSchema,
      messages: {
        required: "The {{ field }} is required to register a new account.",
        confirmed: "The password fields do not match.",
        "username.unique": "That username is already in use",
        "email.email": "Enter a valid email address",
        "email.unique": "That email is already in use",
        "password.minLength":
          "The minimum characters in your password must be greater than or equal to 5.",
      },
    })
    const user = await User.create({ email, username, password })
    await user.related('profile').create({ name: username })

    await user.sendVerifyEmail()

    session.flash('message', 'Registration successful, please verify your email')

    return response.redirect().toRoute('verify.email')
  }

  public async login({ request, response, session, auth }: HttpContextContract) {
    const { uid, password } = request.only(['uid', 'password'])

    try {
      await auth.use('web').attempt(uid, password)

      if (auth.user?.isEmailVerified === false) {
        session.flash('info', 'Please verify your email')
      }

      return response.redirect('/')
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
