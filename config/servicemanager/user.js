db.createUser({
    user: "${LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_USER}",
    pwd: "${LINTO_STACK_STT_SERVICE_MANAGER_MOGODB_PSWD}",
    roles: ["readWrite"]
})
