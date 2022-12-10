import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Token from '../models/Token'

export default class verifyEmailController {
    public async index({ view, auth }: HttpContextContract) {
        if (auth.user?.isEmailVerified === false) {
            await auth.user?.sendVerifyEmail()
        }
        return view.render('auth/verifyEmail')
    }
    
    public async verify({ response, session, params, auth }: HttpContextContract) {
        const user = await Token.getTokenUser(params.token, 'VERIFY_EMAIL')

        if (!user) {
            // handle invalid token
            session.flash('errors', {
                title: 'Your token is invalid or expired'
            })
            return response.redirect().toRoute('verify.email')
          }

        user!.isEmailVerified = true

        await user!.save()
        await Token.expireTokens(user!, 'verifyEmailTokens')

        if (auth.isLoggedIn) {
            return response.redirect('/')
        }

        session.flash('success', 'You are now a verified user, please login!')

        return response.redirect('/login')
    }
}
