# .github

The Pamji Website and git landing page

### how to deploy 
after you run git pull and made your changes you can use the build.sh script in the root folder which will build your changes and force commit the build folder to the production branch
  

### CICD
```mermaid
  graph TD;
      l[local]--push-->p[produciton branch];
 l--deploy-->d1[gh pages production deployment]

 p-->m[master branch]

     
      p--trigger-->pr
      pr-->a[awaiting approval]

a-->m
m--trigger-->a2[gh action for final deployment]
     d1 <--review-->a
			
			a2-->f[final build]
			m-->f
			f-->v[deploy to netlify]

