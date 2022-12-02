import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
// import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Profile from '../models/Profile'

export default class ProfilesController {
    public async show({ view, params }: HttpContextContract) {
        const profile = await Profile.findByOrFail('name', decodeURIComponent(params.name))

        return view.render('dashboard', { profile })
    }

    //TODO Make update profile function
}
