import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'
import Route from '@ioc:Adonis/Core/Route'

test.group("Authentication - Sign up", (group) => {

    group.each.setup(async () => {
        await Database.beginGlobalTransaction()
        return () => Database.rollbackGlobalTransaction()
    })

    test("Unauthenticated user can view the signup page", async ({ client }) => {
        const res = await client.get(Route.makeUrl('/register'))

        res.assertStatus(200)
        res.assertTextIncludes('Register')
    })
})