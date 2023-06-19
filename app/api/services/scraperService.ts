import * as cheerio from 'cheerio';
import axios from 'axios';
import { redditData } from '../deta/init'

export default class ScraperService {
    public async scrapeReddit(scrapeUrl: string, scrapeName: string) {

        const res = await axios.get(scrapeUrl)
        const posts = [] as any[]

        const $ = cheerio.load(res.data)

        $("div.thing").each((_i, el) => {

            let votes = $(el).children().find("div.unvoted").text()

            if (votes.includes("•")) {
                votes = "0"
            }

            posts.push({
                title: $(el).children().find("a.title").text(),
                author: $(el).children().find("a.author").text(),
                votes: votes,
            })
        })

        await redditData.put(scrapeName.replace(/ /g,"-"),
            { 
                data: JSON.stringify(posts),
                contentType: 'application/json' 
            })
        
    }

    public async scrapeDevTo(scrapeUrl: string, scrapeName: string) {

        const res = await axios.get(scrapeUrl)
        const posts = [] as any[];

        const $ = cheerio.load(res.data)

        $("div.crayons-story").each((_i, el) => {

            const link = "https://dev.to"
            const title = $(el).find("a.crayons-story__hidden-navigation-link").text();
            const author = $(el).find("button.profile-preview-card__trigger").text().trim();
            const url = $(el).find("a").attr('href');
            let reactions = $(el).find("a.crayons-btn").contents().text();
            let votes = '0';

            if (reactions.includes("reaction")) {
                votes = reactions.match(/\d+/)![0]
            }

            posts.push({
                title: title,
                author: author,
                url: link + url,
                votes: votes,
            })
        })

        await redditData.put(scrapeName.replace(/ /g,"-"),
            { 
                data: JSON.stringify(posts),
                contentType: 'application/json' 
            })
    }

    public async scrapeWiki(scrapeUrl: string, scrapeName: string) {
        const res = await axios.get(scrapeUrl)
        const posts = [] as any[]

        const $ = cheerio.load(res.data)

        $("#content").each((_i, el) => {

            const title = $(el).find("h1.firstHeading").text();
            const text = $(el).find("p").text().trim();

            posts.push({
                title: title,
                text: text
            })
        })

        await redditData.put(scrapeName.replace(/ /g,"-"),
            { 
                data: JSON.stringify(posts),
                contentType: 'application/json' 
            })
    }

    public async scrapeBiz(scrapeUrl: string, scrapeName: string) {
        const res = await axios.get(scrapeUrl)
        const posts = [] as any[]

        const $ = cheerio.load(res.data)

        $("section.featured-post").each((_i, el) => {
            const title = $(el).find("h2.tout-title").text()
            const description = $(el).find("div.tout-copy").text().trim()

            posts.push({
                title: title,
                description: description
            })

        })

        await redditData.put(scrapeName.replace(/ /g,"-"),
            { 
                data: JSON.stringify(posts),
                contentType: 'application/json' 
            })
    }
}