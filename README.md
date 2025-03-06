# .github

The Pamji Website and git landing page

  
  

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