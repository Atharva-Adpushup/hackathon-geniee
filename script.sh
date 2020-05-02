#! /bin/bash
​
echo ""
echo " -- Console Editor -- "
cd portedApps
echo "installing npm dependencies"
npm i
echo "building min css"
npx grunt
echo "building min css done"
echo "Building console editor"
npm run build
echo " -- Console Editor Build Done -- "
echo ""
​
echo " -- Starting Main App Server -- "
cd ../
npm start
