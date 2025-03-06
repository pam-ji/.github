#!/bin/bash
cd website/app
bun run build
bun run deploy
cd ../../
git add ./website/app/build/ --force
git checkout production
git commit -m "Deploy to production"
git push origin production
#sed -i 's/"homepage": "https:\/\/pam-ji.github.io\/.github\/"/"homepage": "https:\/\/pamji.space"/g' package.json
