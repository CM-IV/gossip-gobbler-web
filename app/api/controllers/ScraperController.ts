import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import playwright from "playwright"
// import Scraper from '../models/Scraper'

export default class ScraperController {
    //TODO have scraper main page return the previously scraped data
    public async show({ view }: HttpContextContract) {
        return view.render('auth/scraper')
    }


    public async scrapeData({ request, response, auth }: HttpContextContract) {
        const scrapeUrl = request.body().scrapeUrl

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
        
        return response.redirect().back()
        
    }
}
