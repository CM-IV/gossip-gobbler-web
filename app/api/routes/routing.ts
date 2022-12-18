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

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})
Route.get('/password/forgot', 'passwordResetController.forgot').as('password.forgot').middleware('guest')
Route.get('/password/reset/:token', 'passwordResetController.reset').as('password.reset').middleware('guest')

Route.get('/verify/email', 'verifyEmailController.index').as('verify.email')
Route.get('/verify/email/:token', 'verifyEmailController.verify').as('verify.email.verify')

Route.get('/profile/:name', 'ProfilesController.show').as('profiles.show').middleware('auth')
Route.get('/profile/:name/edit', 'ProfilesController.edit').as('settings').middleware('auth')
Route.get('/scraper', 'ScraperController.show').as('scraper').middleware('auth')
Route.get('/manage', 'UsersController.manage').as('users.manage').middleware(['auth', 'role:admin'])
Route.get('/register', async ({ view }) => {
  return view.render('auth/register')
}).middleware('guest')
Route.get('/login', async ({ view }) => {
  return view.render('auth/login')
}).middleware('guest')

//API ROUTES
Route.group(() => {
  Route.post('/password/send', 'passwordResetController.send').as('password.send').middleware('guest')
  Route.post('/password/store', 'passwordResetController.store').as('password.store').middleware('guest')
  Route.post('/register', 'AuthController.register').as('auth.register').middleware('guest')
  Route.post('/login', 'AuthController.login').as('auth.login').middleware('guest')
  Route.patch('/profile', 'ProfilesController.update').as('profiles.update').middleware('auth')
  Route.post('/scraper', 'ScraperController.scrapeData').as('scraper.scrapeData').middleware(['auth', 'role:admin,customer'])
  Route.get('/scraper/:name', 'ScraperController.getScrapeJson').as('scraper.scrapeJsonData').middleware(['auth', 'role:admin,customer'])
  Route.delete('/scraper/:name', 'ScraperController.delScrapeJson').as('scraper.delJsonData').middleware(['auth', 'role:admin,customer'])
  Route.get('/logout', 'AuthController.logout').as('auth.logout').middleware('auth')
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
