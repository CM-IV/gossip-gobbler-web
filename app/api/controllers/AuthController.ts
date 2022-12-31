import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Env from '@ioc:Adonis/Core/Env'
import User from '../models/User'

import {
  // Registration
  generateRegistrationOptions,
  verifyRegistrationResponse,
  // Authentication
  // generateAuthenticationOptions,
  // verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  GenerateRegistrationOptionsOpts,
  // GenerateAuthenticationOptionsOpts,
  VerifyRegistrationResponseOpts,
  // VerifyAuthenticationResponseOpts,
  VerifiedRegistrationResponse,
  // VerifiedAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  RegistrationCredentialJSON,
  // AuthenticationCredentialJSON,
  AuthenticatorDevice,
} from '@simplewebauthn/typescript-types'

export default class AuthController {
  public async register({ request, response, session }: HttpContextContract) {
    const userSchema = schema.create({
      email: schema.string({ trim: true }, [
        rules.required(),
        rules.email(),
        rules.unique({ table: 'users', column: 'email', caseInsensitive: true }),
      ]),
      username: schema.string({ trim: false }, [
        rules.required(),
        rules.unique({ table: 'users', column: 'username', caseInsensitive: true }),
      ]),
      password: schema.string({ trim: false }, [
        rules.confirmed('passwordConfirmation'),
        rules.required(),
        rules.minLength(8),
      ]),
    })

    const { email, username, password } = await request.validate({ 
      schema: userSchema,
      messages: {
        required: "The {{ field }} is required to register a new account.",
        confirmed: "The password fields do not match.",
        "username.unique": "That username is already in use",
        "email.email": "Enter a valid email address",
        "email.unique": "That email is already in use",
        "password.minLength":
          "The minimum characters in your password must be greater than or equal to 8.",
      },
    })
    const user = await User.create({ email, username, password })
    await user.related('profile').create({ name: username })

    await user.sendVerifyEmail()

    session.flash('message', 'Registration successful, please verify your email')

    return response.redirect().toRoute('verify.email')
  }

  public async login({ request, response, session, auth }: HttpContextContract) {
    const { uid, password } = request.only(['uid', 'password'])

    try {
      await auth.use('web').attempt(uid, password)

      if (auth.user?.isEmailVerified === false) {
        session.flash('info', 'Please verify your email')
      }

      return response.redirect('/')
    } catch {
      session.flash('errors', {
        title: 'Username, email, or password is incorrect',
      })

      return response.redirect().back()
    }
  }

  public async logout({ auth, response }: HttpContextContract) {
    await auth.logout()

    return response.redirect('/')
  }

  //WebAuthN functions//

  //Registration - Generate Registration Options
  public async registrationOptions({ auth, response }: HttpContextContract) {
    const userName = auth.user?.username as string
    const userID = auth.user?.id as string
    // const userAuthenticators = auth.user?.devices as AuthenticatorDevice[]
    const opts: GenerateRegistrationOptionsOpts = {
      rpName: Env.get('RP_NAME'),
      rpID: Env.get('RP_ID'),
      userID,
      userName,
      attestationType: 'none',
      supportedAlgorithmIDs: [-7, -257]
    }

    const options = generateRegistrationOptions(opts)

    auth.user!.currentChallenge = options.challenge

    return response.json(options)
    
  }

  //Registration - Verify Registration Response
  public async registrationResponse({ auth, request, response }: HttpContextContract) {
    const body = request.body() as RegistrationCredentialJSON
    const expectedChallenge = auth.user?.currentChallenge as string

    let verification: VerifiedRegistrationResponse

    try {
      const opts: VerifyRegistrationResponseOpts = {
        credential: body,
        expectedChallenge,
        expectedOrigin: Env.get('RP_ORIGIN'),
        expectedRPID: Env.get('RP_ID'),
        requireUserVerification: true
      }

      verification = await verifyRegistrationResponse(opts)
    } catch (error) {
      return response.status(400).send({ error: error.message })
    }

    const { verified, registrationInfo } = verification

    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = registrationInfo

      const existingDevice = auth.user?.devices.find((device) => device.credentialID.equals(credentialID))

      if (!existingDevice) {

        const newDevice: AuthenticatorDevice = {
          credentialPublicKey,
          credentialID,
          counter,
          transports: body.transports
        }

        //Does this work?
        auth.user?.devices.push(newDevice)
      }
    }

    return response.send({ verified })
  }
}
