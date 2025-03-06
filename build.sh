#!/bin/bash
cd website/app
#bun run build
cd ../../
git add build.sh
git stash
git checkout -d build
git switch build
git stash
git add -f ./website/app/build
git commit -m "Deploy to build"
git push origin build
#sed -i 's/"homepage": "https:\/\/pam-ji.github.io\/.github\/"/"homepage": "https:\/\/pamji.space"/g' package.json
