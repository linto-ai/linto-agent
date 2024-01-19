db.createUser({
    user: "${LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_USER}",
    pwd: "${LINTO_STACK_STT_SERVICE_MANAGER_MONGODB_PSWD}",
    roles: ["readWrite"]
})
