#!/bin/bash

# Copyright 2018 Linagora (author: Ilyes Rebai; email: irebai@linagora.com)
# LinSTT project

# Param
order=3
. parse_options.sh || exit 1;
# End

# Begin configuration section.
model=$1 # the path of the acoustic model
lmodel=$2 # the path to the decoding graph
lmgen=$3 # the path to the language generation directory
out=$4 # the output folder where to save the generated files

## Working param
dictgen=$lmgen/dict
g2p_model=$lmgen/g2p/model
g2p_tool=$(cat $lmgen/g2p/.tool)

## Create Output folders
dict=$out/dict
lex=$out/lexicon
lang=$out/lang
graph=$out/graph
fst=$out/fst
arpa=$out/arpa
# End configuration section.

################################################## GENERATE THE LANG DIR ######################################
#create lang dir
prepare_lang.sh $dict "<unk>" $lang/tmp $lang
if [ $? -eq 1 ]; then exit 1; fi
###############################################################################################################

################################################## GENERATE THE ARPA FILE #####################################
#create arpa using irstlm
sed -i "s/#/#nonterm:/g" $out/text
add-start-end.sh < $out/text > $out/text.s
ngt -i=$out/text.s -n=$order -o=$out/irstlm.${order}.ngt -b=yes 2>/dev/null
tlm -tr=$out/irstlm.${order}.ngt -n=$order -lm=wb -o=$arpa 2>/dev/null
###############################################################################################################
 
################################################## GENERATE THE GRAMMAR FILE ##################################
#create G
langm=${lang}_new/main
mkdir -p $langm
cp -r $lang/* $langm
arpa2fst --disambig-symbol=#0 --read-symbol-table=$lang/words.txt $arpa $langm/G.fst
mkgraph.sh --self-loop-scale 1.0 $langm $model $graph/main

cmd=""
for e in $(cat $fst/.entities); do
  echo "Preparing the graph of the entity $e"
  lange=${lang}_new/$e
  mkdir -p $lange
  cp -r $lang/* $lange
  awk -f fst.awk $lang/words.txt $fst/$e > $lange/$e.int
  fstcompile $lange/$e.int | fstarcsort --sort_type=ilabel > $lange/G.fst
  mkgraph.sh --self-loop-scale 1.0 $lange $model $graph/$e
  id=$(grep "#nonterm:"$e" " $lang/phones.txt | awk '{print $2}')
  cmd="$cmd $id $graph/$e/HCLG.fst"
done
###############################################################################################################

################################################## GENERATE THE HCLG FILE #####################################
#create HCLG
if [ "$cmd" == "" ]; then
  mkdir -p $graph
  cp $graph/main/HCLG.fst  $graph
  cp $graph/main/words.txt $graph
else
  echo "Preparing the main graph"
  offset=$(grep nonterm_bos $lang/phones.txt | awk '{print $2}')
  make-grammar-fst --write-as-grammar=false --nonterm-phones-offset=$offset $graph/main/HCLG.fst \
           $cmd $graph/HCLG.fst
  cp $lang/words.txt $graph
fi
if [ ! -f $graph/HCLG.fst ]; then
  echo "Error occured during generating the new decoding graph"
  exit 1
fi
###############################################################################################################

################################################## SAVE THE GENERATED FILES ###################################
#copy new HCLG to model dir
cp $graph/HCLG.fst $lmodel
cp $graph/words.txt $lmodel
#return the oov if exists
if [ -s $lex/oov_vocab ]; then
  oov=$(cat $lex/oov_vocab | tr '\n' ',')
fi
###############################################################################################################


