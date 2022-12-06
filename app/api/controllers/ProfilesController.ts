import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'
import Profile from '../models/Profile'

export default class ProfilesController {
  public async show({ view, params, auth }: HttpContextContract) {
    const profile = await Profile.findByOrFail('name', decodeURIComponent(params.name))

    const scrapes = await Database
      .from('scrapers')
      .count('* as total')
      .where('user_id', auth.user!.id)

    return view.render('auth/profile', {
      totalScrapes: scrapes[0].total,
      profile
    })
  }

  public async edit({ view, auth }: HttpContextContract) {
    const profile = await Profile.findBy('userId', auth.user?.id)

    await profile?.load('user')

    return view.render('auth/editProfile', { profile })
  }

  public async update({ auth, request, response }: HttpContextContract) {
    const profile = await Profile.findBy('userId', auth.user?.id)

    const profileSchema = schema.create({
      bio: schema.string.nullable(),
      avatar: schema.string.nullable({}, [rules.url()]),
      name: schema.string({ trim: true }),
      email: schema.string({}, [rules.email()]),
      password: schema.string.nullable({ trim: true }, [rules.minLength(8)]),
    })

    const { email, password, ...profileValues } = await request.validate({ schema: profileSchema })

    await profile?.merge(profileValues).save()

    if (email) {
      await auth.user?.merge({ email }).save()
    }

    if (password) {
      await auth.user?.merge({ password }).save()
    }

    const profileInfo = await auth.user?.related('profile').query().first()

    return response.redirect().toRoute('profiles.show', { name: profileInfo?.name })
  }
}
