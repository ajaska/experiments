#!/bin/bash

set -x

while read p; do
  curl -O --create-dirs --output ./"$p".ogg https://learningmusic.ableton.com/lessons/sounds/"$p".ogg 
  curl -O --create-dirs --output ./"$p".mp4 https://learningmusic.ableton.com/lessons/sounds/"$p".mp4 
done <sound_files.txt

