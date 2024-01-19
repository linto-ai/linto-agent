#!/usr/bin/awk -f

BEGIN {
  # ARGV[0] is the filename of the script itself.
  # Set ARGV length.
  file=ARGV[2] #file to proceed
  word=ARGV[1] #word dictionary
  n=split(file,e,"/")
  entity=e[n]
  inode=1
  onode=2
  tnode=3
  while(( getline line< word) > 0 ) {
      split(line,a," ")
      words[a[1]]=a[2]
  }
  print("0 1 "words["#nonterm_begin"]" "words["<eps>"])
}
{
  while(( getline line< file) > 0 ) {
      n=split(line,a," ")
      inode=1
      for(i=1;i<n;i++){
         print(inode" "tnode" "words[a[i]]" "words[a[i]])
         inode=tnode
         tnode=tnode+1
      }
      print(inode" "onode" "words[a[i]]" "words[a[i]])
  }
}
END {
  print("2 3 "words["#nonterm_end"]" "words["<eps>"])
  print("3")
}
