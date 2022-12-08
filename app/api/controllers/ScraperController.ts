import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import playwright from "playwright"
import { redditData } from '../deta/init'
import Scraper from '../models/Scraper'

export default class ScraperController {
    public async show({ view, auth }: HttpContextContract) {

        const scrapeFiles = await redditData.list()

        const filteredFiles = scrapeFiles.names.filter(file => file.includes(auth.user!.username))

        return view.render('auth/scraper', { filteredFiles })
    }


    public async scrapeData({ request, response, auth, session }: HttpContextContract) {

        try {
            const username = auth.user!.username;
            const fileName = request.input("name")
            const scrapeName = `${fileName}-${username}.json`
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
                data.push({ scrapeUrl, scrapeName, title, author, votes });
            }

            await browser.close();

            await auth.user!.related('scrapers').createMany(data)

            await redditData.put(scrapeName,
                { 
                    data: JSON.stringify(data, null, 2)
                        .replace(/'/g, "\\'")
                        .replace(/[\u0000-\u0019]+/g,""),
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

    public async getScrapeJson({ params, response }: HttpContextContract) {
        const fileName = params.name

        const blob = await redditData.get(fileName) as Blob

        const jsonData = await blob.text()

        return response.send(JSON.stringify(jsonData))
    }

    public async delScrapeJson({ params, response }: HttpContextContract) {
        const fileName = params.name

        await redditData.delete(fileName)

        await Scraper.query().where("scrapeName", fileName).delete()

        return response.redirect().back()
    }
}
