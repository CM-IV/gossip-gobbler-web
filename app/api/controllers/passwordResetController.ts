import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Mail from '@ioc:Adonis/Addons/Mail'
import Route from '@ioc:Adonis/Core/Route'
import Env from '@ioc:Adonis/Core/Env'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from '../models/User'
import Token from '../models/Token'

export default class passwordResetController {
    public async forgot({ view }: HttpContextContract) {
        return view.render('auth/forgotPassword')
    }

    public async send({ request, response, session }: HttpContextContract) {
        const emailSchema = schema.create({
            email: schema.string([rules.email()])
        })

        const { email } = await request.validate({ schema: emailSchema })

        const user = await User.findBy('email', email)

        const token = await Token.generatePasswordResetToken(user)

        const resetLink = Route.makeUrl('password.reset', [token])

        if (user) {
            await Mail.sendLater(message => {
                message
                    .from('auth-helper@civdev.xyz')
                    .to(user.email)
                    .subject('Reset Your Password')
                    .html(`Reset your password by <a href="${Env.get('DOMAIN')}${resetLink}">clicking here</a>`)
            })
        }

        session.flash('success', 'If an account matches the provided email, you will receive a password reset link shortly')
        return response.redirect().back()
    }

    public async reset({ view, params }: HttpContextContract) {
        const token = params.token

        const isValid = await Token.verify(token, 'PASSWORD_RESET')

        return view.render('auth/resetPassword', { isValid, token })
    }

    public async store({ request, response, session, auth }: HttpContextContract) {
        const passwordSchema = schema.create({
            token: schema.string(),
            password: schema.string({ trim: false }, [
                rules.confirmed('passwordConfirmation'),
                rules.required(),
                rules.minLength(8),
            ]),
        })

        const { token, password } = await request.validate({ schema: passwordSchema })

        const user = await Token.getTokenUser(token, 'PASSWORD_RESET')

        if (!user) {
            session.flash('errors', {
                title: 'Token expired or user could not be found',
            })

            return response.redirect().back()
        }

        await user.merge({ password }).save()

        await Token.expireTokens(user, 'passwordResetTokens')

        await auth.login(user)

        return response.redirect().toPath('/')
    }
}
