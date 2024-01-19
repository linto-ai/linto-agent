# LinTO client

LinTO Client-server connectivity

This module sequences actions, dispatches informations or triggers between any other modules on the LinTO device
This module is part of the LinTO project, it's the only remote subscriber/publisher, through MQTT(s) protocol, to the LinTO business-logic and exploitation servers.

## Dependencies

This program uses a **node.js 9+** runtime. before first run you first need to install node module dependencies

```
npm install
```

## HOW TO Use the module

create a .env file based on .envdefault
run the software with :
```
node index.js
```
You might overload any of environement variables at runtime
```
node MY_PREFERED_VALUE=42 index.js
```

You shall use something like **PM2** to maintain the process.


**Have fun building your LinTO**
