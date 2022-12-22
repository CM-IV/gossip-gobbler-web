import { BaseModel } from "@ioc:Adonis/Lucid/Orm";
import camelCaseNamingStrategy from "../strategies/camelCaseNamingStrategy";

export default class AppBaseModel extends BaseModel {
    public static namingStrategy = new camelCaseNamingStrategy()
}