# Default
Default overwatch API, allow to get basic information of the service running, authentication methods running, ...

## Healths

Health checks for overwatch service

**URL** : `/:LINTO_STACK_OVERWATCH_BASE_PATH/healthcheck`

**Method** : `GET`

**Auth required** : NO

### Success Response

**Code** : `200 OK`

**Body Content**
```
OK
```

## Authentication methods
List of enable authentication services

**URL** : `/:LINTO_STACK_OVERWATCH_BASE_PATH/auths`

**Method** : `GET`

**Auth required** : NO

### Success Response

**Code** : `200 OK`

**Body Content**
```json
[
  {
    "type": "local",
    "basePath": "/local"
  },
  {
    "type": "ldap",
    "basePath": "/ldap"
  }
]
```