import { schema, rules } from '@ioc:Adonis/Core/Validator'

export const scrapeSchema = schema.create({
    fileName: schema.string(),
    scrapeUrl: schema.string({}, [rules.url({
        allowedHosts: ["old.reddit.com", "dev.to", "en.wikipedia.org", "www.businessinsider.com"],
        protocols: ["https"]
    })]),
    selection: schema.string()
})