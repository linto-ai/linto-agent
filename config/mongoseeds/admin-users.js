db.createUser({
    user: "${LINTO_STACK_MONGODB_USER}",
    pwd: "${LINTO_STACK_MONGODB_PASSWORD}",
    roles: ["readWrite"]
})