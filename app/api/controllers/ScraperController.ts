import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import * as cheerio from 'cheerio';
import axios from 'axios';
import { redditData } from '../deta/init'

export default class ScraperController {
    public async show({ view, auth }: HttpContextContract) {

        const scrapeFiles = await redditData.list()

        const filteredFiles = scrapeFiles.names.filter(file => file.includes(auth.user!.username))

        return view.render('auth/scraper', { filteredFiles })
    }


    public async scrapeData({ request, response, auth, session }: HttpContextContract) {

        try {
            const username = auth.user!.username
            const fileName = request.input("name")
            const scrapeName = `${fileName}-${username}.json`
            const scrapeUrl = request.input("scrapeUrl")
            const selection = request.input("selection")

            const posts = [] as any[]

            const res = await axios.get(scrapeUrl)

            const $ = cheerio.load(res.data)

            if (selection === "old.reddit.com posts") {
                $("div.thing").each((_i, el) => {
                    posts.push({
                        title: $(el).children().find("a.title").text(),
                        author: $(el).children().find("a.author").text(),
                        votes: $(el).children().find("div.unvoted").text(),
                    })
                })

                await redditData.put(scrapeName.replace(/ /g,"-"),
                    { 
                        data: JSON.stringify(posts, null, 2)
                            .replace(/'/g, "\\'")
                            .replace(/[\u0000-\u0019]+/g,""),
                        contentType: 'application/json' 
                    })

                session.flash('message', 'Scrape Successful')
        
                return response.redirect().back()
            }

            $("div.crayons-story").each((_i, el) => {
                posts.push({
                    title: $(el).find("a.crayons-story__hidden-navigation-link").text(),
                    author: $(el).find("button.profile-preview-card__trigger").text().trim(),
                    votes: $(el).find("a.crayons-btn").text().replace(/\n/g,'').match(/(\d+)/)![0],
                })
            }) 

            await redditData.put(scrapeName.replace(/ /g,"-"),
                { 
                    data: JSON.stringify(posts, null, 2)
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

    public async delScrapeJson({ params, response, session }: HttpContextContract) {
        const fileName = params.name

        await redditData.delete(fileName)

        session.flash('message', 'Scrape Deleted')

        return response.redirect().back()
    }
}
