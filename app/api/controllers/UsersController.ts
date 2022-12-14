import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Papa from "papaparse"
import Roles from '../enums/Role'
import Role from '../models/Role'
import User from '../models/User'

export default class UsersController {
  public async manage({ request, view }: HttpContextContract) {
    const page = request.input('page', 1)

    const users = await User.query().orderBy('role_id').orderBy('username').paginate(page, 8)

    const roles = await Role.query().orderBy('role')

    return view.render('admin/manage', {
      users: users.serialize(),
      roles: roles,
    })
  }

  public async mutateRole({ request, response, params, auth }: HttpContextContract) {
    const roleSchema = schema.create({
      roleId: schema.number([rules.exists({ table: 'roles', column: 'id' })]),
    })

    const payload = await request.validate({ schema: roleSchema })

    const user = await User.findOrFail(params.id)

    const isAuthUser = user.id === auth.user?.id

    await user.merge(payload).save()

    return isAuthUser && user.roleId !== Roles.ADMIN
      ? response.redirect('/')
      : response.redirect().back()
  }

  public async exportCsv({ response }: HttpContextContract) {
    
    const users = await User.query().orderBy('role_id').orderBy('username')

    const data = users.map((user) => user.serialize())

    const csv = Papa.unparse(data)

    response.header("Content-Type", "text/csv")

    response.attachment("users.csv")

    return response.send(csv)
  }

  public async destroy({ response, params, auth }: HttpContextContract) {
    const user = await User.findOrFail(params.id)
    const isAuthUser = user.id === auth.user?.id

    await user.delete()

    return isAuthUser ? response.redirect('/') : response.redirect().back()
  }
}
