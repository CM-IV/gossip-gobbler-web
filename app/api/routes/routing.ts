/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file.
*/

import Route from '@ioc:Adonis/Core/Route'
import HealthCheck from '@ioc:Adonis/Core/HealthCheck'

//VIEWS
Route.get('/', async ({ view }) => {
  return view.render('welcome')
})
Route.get('dashboard', async ({ view }) => {
  return view.render('dashboard')
}).middleware('auth')
Route.get('manage', 'UsersController.manage').as('users.manage').middleware(['auth', 'role:admin'])
Route.get('register', async ({ view }) => {
  return view.render('auth/register')
})
Route.get('login', async ({ view }) => {
  return view.render('auth/login')
})

//API ROUTES
Route.group(() => {
  Route.post('register', 'AuthController.register').as('auth.register')
  Route.post('login', 'AuthController.login').as('auth.login')

  Route.get('logout', 'AuthController.logout').as('auth.logout').middleware('auth')
  Route.delete('/:id', 'UsersController.destroy').as('destroy').middleware(['auth', 'role:admin'])
  Route.patch('/:id/role', 'UsersController.mutateRole')
    .as('role')
    .middleware(['auth', 'role:admin'])  

  //Health check
  Route.get('health', async ({ response }) => {
    const report = await HealthCheck.getReport()

    return report.healthy ? response.ok(report) : response.badRequest(report)
  })
}).prefix('/api')
