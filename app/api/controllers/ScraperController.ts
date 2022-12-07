import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import playwright from "playwright"
import { redditData } from '../deta/init'

export default class ScraperController {
    public async show({ view, auth, session }: HttpContextContract) {

        if (!auth.user!.isCustomer && !auth.user!.isAdmin) {
            session.flash('errors', {
                title: 'For page scrapes and data access, contact chuck@civdev.xyz for a customer plan!'
            })
        }

        const scrapeFiles = await redditData.list()

        const filteredFiles = scrapeFiles.names.filter(file => file.includes(auth.user!.username))

        return view.render('auth/scraper', { filteredFiles })
    }


    public async scrapeData({ request, response, auth, session }: HttpContextContract) {

        try {

            if (!auth.user!.isCustomer && !auth.user!.isAdmin) {
                session.flash('errors', {
                    title: 'For page scrapes and data access, contact chuck@civdev.xyz for a customer plan!'
                })

                return response.redirect().back()
            }

            const username = auth.user!.username;
            const name = request.input("name")
            const scrapeUrl = request.input("scrapeUrl")

            const browser = await playwright.firefox.launch({
                headless: true
            })

            const page = await browser.newPage();

            await page.goto(scrapeUrl)
            
            const data = [] as any[];
            await page.waitForSelector("#siteTable");
            const posts = await page.$$('div.thing');
            
            for (let post of posts) {
                const title = await post.$eval('a.title', el => el.textContent);
                const author = await post.$eval('a.author', el => el.textContent);
                const votes = await post.$eval('.score.unvoted', el => el.textContent);
                data.push({ scrapeUrl, title, author, votes });
            }

            await browser.close();

            await auth.user!.related('scrapers').createMany(data)

            await redditData.put(`${name}-${username}.json`,
                { 
                    data: JSON.stringify(data, null, 2)
                        .replace(/'/g, "\\'"),
                    contentType: 'application/json' 
                })

            session.flash('message', 'Scrape Successful')
            
            return response.redirect().back()

        } catch (error) {
            console.error(error)
            session.flash('errors', {
                title: 'There was an error!'
            })
            return response.redirect().back()
        }
        
    }
    //TODO -- List or Get back JSON files
}
