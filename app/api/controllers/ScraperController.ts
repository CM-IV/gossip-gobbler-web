import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { scrapeSchema } from '../utils/validator'
import { redditData } from '../deta/init'
import ScraperService from '../services/scraperService'

export default class ScraperController {
    public scrapeService: ScraperService

    constructor() {
        this.scrapeService = new ScraperService()
    }


    public async show({ view, auth }: HttpContextContract) {

        const scrapeFiles = await redditData.list()

        const filteredFiles = scrapeFiles.names.filter(file => file.includes(auth.user!.username))

        return view.render('auth/scraper', { filteredFiles })
    }


    public async scrapeData({ request, response, auth, session }: HttpContextContract) {

        const { fileName, scrapeUrl, selection } = await request.validate({ schema: scrapeSchema })

        const username = auth.user!.username
        const scrapeName = `${fileName}-${username}.json`

        try {

            if (selection === "old.reddit.com posts") {
                
                await this.scrapeService.scrapeReddit(scrapeUrl, scrapeName)

                session.flash('message', 'Scrape Successful')

                return response.redirect().back()
            }

            else if (selection === "dev.to posts") {

                await this.scrapeService.scrapeDevTo(scrapeUrl, scrapeName)

                session.flash('message', 'Scrape Successful')
        
                return response.redirect().back()
            }
            
            else if (selection === "business insider posts") {

                await this.scrapeService.scrapeBiz(scrapeUrl, scrapeName)

                session.flash('message', 'Scrape Successful')
        
                return response.redirect().back()
            } else {
        
                await this.scrapeService.scrapeWiki(scrapeUrl, scrapeName)

                session.flash('message', 'Scrape Successful')
            
                return response.redirect().back()
            }

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

    public async delScrapeJson({ params, response, session }: HttpContextContract) {
        const fileName = params.name

        await redditData.delete(fileName)

        session.flash('message', 'Scrape Deleted')

        return response.redirect().back()
    }
}
