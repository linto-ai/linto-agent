#!/bin/bash

# User can define the model path : MODELS_FOLDER

HOST_RELEASES=https://github.com/linto-ai/linto-platform-stt-server-worker-client/releases/download/
HOST_TAGS=https://api.github.com/repos/linto-ai/linto-platform-stt-server-worker-client/tags

TAGS_LIST=()
OK_TAGS=false

TAGS=$(curl -s --request GET --url $HOST_TAGS) >/dev/null

if [ -z "$MODELS_FOLDER" ]; then
  MODELS_FOLDER=./models
fi

if ! dpkg -s jq >/dev/null 2>&1; then
  echo 'JQ is require for json parsing'
  echo 'sudo apt-get install jq'
  sudo apt-get install jq
fi

echo 'Which model to use ?'

# LIST TAG MODEL
for row in $(echo "${TAGS}" | jq -r '.[] | @base64'); do
  _jq() {
    echo ${row} | base64 --decode | jq -r ${1}
  }
  echo ' * '$(_jq '.name')
  TAGS_LIST+=($(_jq '.name'))
done

# GET USER DESIRED TAG
printf 'Name of tags : '
read -r USER_TAG
echo

# CHECK IF USER TAG IS IN THE LIST
for item in "${TAGS_LIST[@]}"; do
  if [[ $USER_TAG == "$item" ]]; then
    OK_TAGS=true
    break
  fi
done

# DOWNLOAD MODEL IF TAG EXIST
if [ "$OK_TAGS" = true ]; then
  find ./models -mindepth 1 ! -name '.gitkeep' -exec rm -r {} +
  mkdir -p $MODELS_FOLDER

  echo 'Do you want an empty model'
  printf 'Enter [y/n]: '
  read -r IS_EMPTY
  echo

  # GET TAG MODEL
  if [[ $IS_EMPTY == "y" ]]; then
    mkdir $MODELS_FOLDER/graph_en
    mkdir $MODELS_FOLDER/graph_fr
  else
    $(wget -q --show-progress -P $MODELS_FOLDER/ $HOST_RELEASES$USER_TAG/graph_en.zip)
    $(wget -q --show-progress -P $MODELS_FOLDER/ $HOST_RELEASES$USER_TAG/graph_fr.zip)
    unzip -qo $MODELS_FOLDER/graph_fr.zip -d $MODELS_FOLDER/
    unzip -qo $MODELS_FOLDER/graph_en.zip -d $MODELS_FOLDER/
  fi
  $(wget -q --show-progress -P $MODELS_FOLDER/ $HOST_RELEASES$USER_TAG/linstt_en_acoustic_model.zip)
  $(wget -q --show-progress -P $MODELS_FOLDER/ $HOST_RELEASES$USER_TAG/linstt_fr_acoustic_model.zip)
  unzip -qo $MODELS_FOLDER/linstt_en_acoustic_model.zip -d $MODELS_FOLDER/en/
  unzip -qo $MODELS_FOLDER/linstt_fr_acoustic_model.zip -d $MODELS_FOLDER/fr/

  # DELETE ZIP FILE
  echo 'DELETING ZIP FILE'
  rm $MODELS_FOLDER/*.zip
else
  echo "$USER_TAG isn't a tags listed above"
fi
