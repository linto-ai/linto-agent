db.createUser({
  user: "root",
  pwd: "example",
  roles: [{
    role: "readWrite",
    db: "lintoAdmin"
  }]
})