
# Linto-Platform-Mongodb-Migration
This services is a one shoot scripts that might migrate LinTO Platform databases content when needed (version bumps, rollbacks...)

## Usage

See documentation : [doc.linto.ai](https://doc.linto.ai)

# Deploy

With our proposed stack [linto-platform-stack](https://github.com/linto-ai/linto-platform-stack)

# Develop

## Install project
```
git clone https://github.com/linto-ai/linto-platform-mongodb-migration.git
linto-platform-mongodb-migration
npm install
```

## Environment
`cp .envdefault .env`
Then update the `.env` to manage your personal configuration

## User

Based on your environment settings, an user may be require to be create
```
db.createUser({
	user: "LINTO_STACK_MONGODB_USER",
	pwd: "LINTO_STACK_MONGODB_PASSWORD",
	roles: ["readWrite"]
})
```

## RUN
Run de mongodb migration : `npm run migrate`
A database with a set of collection will be create if it's successful.
