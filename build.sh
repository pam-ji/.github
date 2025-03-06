#!/bin/bash
cd website/app
#bun run build
cd ../../

git add ./website/app/build/ --force
git checkout build
git commit -m "Deploy to build"
git push origin build
#sed -i 's/"homepage": "https:\/\/pam-ji.github.io\/.github\/"/"homepage": "https:\/\/pamji.space"/g' package.json
