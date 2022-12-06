import { Deta } from 'deta';
import Env from '@ioc:Adonis/Core/Env'

const deta = Deta(Env.get('DETA_KEY'))

export const redditData = deta.Drive("Reddit Data")