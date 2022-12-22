import { LucidModel, SnakeCaseNamingStrategy } from "@ioc:Adonis/Lucid/Orm";
import { string } from "@ioc:Adonis/Core/Helpers"

export default class camelCaseNamingStrategy extends SnakeCaseNamingStrategy {
    public serializedName(_model: LucidModel, attributeName: string): string {
        return string.camelCase(attributeName)
    }
}