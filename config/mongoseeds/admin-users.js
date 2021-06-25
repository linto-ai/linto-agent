try{
  db.createUser({
    user: "${LINTO_STACK_MONGODB_USER}",
    pwd: "${LINTO_STACK_MONGODB_PASSWORD}",
    roles: [
        {
            role: "readWrite",
            db: "${LINTO_STACK_MONGODB_DBNAME}"
        }
    ]
  })
}catch(error){
  if (error.message === "couldn't add user: User \"${LINTO_STACK_MONGODB_USER}@${LINTO_STACK_MONGODB_DBNAME}\" already exists") {
    print('Skip user creation, user alraedy created')
  } else {
    throw (error)
  }
}
