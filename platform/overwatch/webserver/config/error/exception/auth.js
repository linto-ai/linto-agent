/****************
***Android*******
****************/

class InvalidCredential extends Error {
  constructor(message) {
    super()
    this.name = 'InvalidCredential'
    this.type = 'auth_android'
    this.status = '401'
    if (message) this.message = message
    else this.message = 'Wrong user credential'
  }
}

class UnableToGenerateKeyToken extends Error {
  constructor(message) {
    super()
    this.name = 'UnableToGenerateKeyToken'
    this.type = 'auth_android'
    this.status = '401'
    if (message) this.message = message
    else this.message = 'Overwatch was not able to generate the keyToken'
  }
}

class UserNotFound extends Error {
  constructor(message) {
    super()
    this.name = 'UserNotFound'
    this.type = 'auth_android'
    this.status = '401'
    if (message) this.message = message
    else this.message = 'Unable to find the user'
  }
}


/****************
*******Web*******
****************/

class NoSecretFound extends Error {
  constructor(message) {
    super()
    this.name = 'NoSecretFound'
    this.type = 'auth_web'
    this.status = '404'
    if (message) this.message = message
    else this.message = 'Secret token is missing'
  }
}

class NoSlotAvailable extends Error {
  constructor(message) {
    super()
    this.name = 'NoSlotAvailable'
    this.type = 'auth_web'
    this.status = '401'
    if (message) this.message = message
    else this.message = 'No slot available for the requested website'
  }
}

class NoTokenApplicationFound extends Error {
  constructor(message) {
    super()
    this.name = 'NoTokenApplicationFound'
    this.type = 'token_not_found'
    this.status = '404'
    if (message) this.message = message
    else this.message = 'Requested token application not found for the origin'
  }
}

class UnreservedSlot extends Error {
  constructor(message) {
    super()
    this.name = 'UnreservedSlot'
    this.type = 'auth_web'
    this.status = '401'
    if (message) this.message = message
    else this.message = 'No slot has been reserved for these user'
  }
}

class NoWebAppFound extends Error {
  constructor(message) {
    super()
    this.name = 'NoWebAppFound'
    this.type = 'auth_web'
    this.status = '401'
    if (message) this.message = message
    else this.message = 'No registred webapp has been found for the host'
  }
}

/****************
***Passport******
****************/

class MalformedToken extends Error {
  constructor(message) {
    super()
    this.name = 'MalformedToken'
    this.type = 'auth'
    this.status = '401'
    if (message) this.message = message
    else this.message = 'The token is malformed'
  }
}


module.exports = {
  //Android Exception
  InvalidCredential,
  UnableToGenerateKeyToken,
  UserNotFound,
  //Web Exception
  NoSecretFound,
  NoSlotAvailable,
  NoTokenApplicationFound,
  NoWebAppFound,
  UnreservedSlot,
  //Passport Exception
  MalformedToken,
}