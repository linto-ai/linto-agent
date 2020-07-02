
# Linto-Platform-Mongo

Adapt these scripts based on your definition for mounted mongoDb volumes /!\

# DATABASE BACKUP

Execute the script 

```shell
cd scripts
./db_backup.sh
```
Select the mongo instance to backup

A **tar** will be dumped here : `${$LINTO_SHARED_MOUNT}/.dbbackup/<docker-container-name>-<current-data>.tar.gz`


# DATABASE RESTORE

Execute the script with the desired date to restore

```shell
cd scripts
./db_restore.sh
```