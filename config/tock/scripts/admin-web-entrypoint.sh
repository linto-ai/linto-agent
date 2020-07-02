#!/bin/bash
set -e

find /maven/ -type f -exec sed -i 's,<base href="/",<base href="/tock/",g' {} +

find /maven/ -name '*.js' -type f -exec sed -i "s,'/assets/images/,'/tock/assets/images/,g" {} +
find /maven/ -name '*.js' -type f -exec sed -i 's,"/assets/images/,"/tock/assets/images/,g' {} +
find /maven/ -name '*.js' -type f -exec sed -i "s,'assets/images/,'/tock/assets/images/,g" {} +
find /maven/ -name '*.js' -type f -exec sed -i 's,"assets/images/,"/tock/assets/images/,g' {} +

cd /maven/
eval "$@"
