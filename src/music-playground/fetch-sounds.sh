#!/bin/bash

while read p; do
  curl https://learningmusic.ableton.com/lessons/sounds/"$p".ogg -O --create-dirs --output ./"$p".ogg
done <sound_files.txt

