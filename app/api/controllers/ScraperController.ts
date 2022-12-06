import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import playwright from "playwright"
import Scraper from '../models/Scraper'
import { redditData } from '../deta/init'

export default class ScraperController {
    public async show({ view, auth }: HttpContextContract) {

        if (auth.user!.isAdmin) {
            const adminScrapeData = await Scraper.query()

            return view.render('auth/scraper', { adminScrapeData })
        }

        const scrapeData = await Scraper
            .query()
            .where("user_id", auth.user!.id)

        return view.render('auth/scraper', { scrapeData })
    }


    public async scrapeData({ request, response, auth, session }: HttpContextContract) {

        try {
            const name = request.input("name")
            const scrapeUrl = request.input("scrapeUrl")
            // const select = request.input("selector")

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

            await auth.user?.related('scrapers').createMany(data)

            await redditData.put(`${name}.json`,
                { 
                    data: JSON.stringify(data, null, 2), 
                    contentType: 'application/json' 
                })

            session.flash('message', 'Scrape Successful')
            
            return response.redirect().back()

        } catch (error) {
            console.error(error)
            session.flash('errors', {
                title: 'There was an error!',
                description: error
            })
            return response.redirect().back()
        }
        
    }
    //TODO -- List or Get back JSON files
}
