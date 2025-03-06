# .github

The Pamji Website and git landing page

### how to deploy 
after you run git pull and made your changes you can use the build.sh script in the root folder which will build your changes and force commit the build folder to the production branch
  

### CICD
```mermaid
  graph TD;
      local--push-->p[produciton branch];
      p--trigger--> b[gh action build];
      b--deploy-->d1[gh pages production deployment]
      p--trigger-->pr
      pr-->a[awaiting approval]
      d1 <--review-->a
			a--trigger-->a2[gh action for final deployment]
			a2-->f[final build]
			p-->f
			f-->v[deploy to netlify]