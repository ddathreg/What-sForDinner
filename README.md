# What-sForDinner

what is for dinner

Will Aiden Kyle Dane Nathan

# Deployed URL

https://ambitious-tree-0c41c301e.6.azurestaticapps.net

# Technical Specification

https://docs.google.com/document/d/100uOvXXVBDtUlq21Loc0mE9Szhwt9eZojN7OJvCMnuU/edit?tab=t.0


# Required Software:

```
Frontend:
React
Vite
Material UI

Backend:
Node.js
Express

```
# Packages Required
```
npm install react-custom-roulette
npm install @mui/material @emotion/react @emotion/styled
```
# Figma Prototype

https://www.figma.com/proto/hy3kAELgdHqz1F2znlvVGu/What's-For-Dinner-Prototype?node-id=0-1&t=rXcV0mLqGc0kZqoC-1

## Coding Style Guide

For this project we use Prettier for automatic code formating
check .prettierrc for format configs

Scripts:

npm run lint - check for issues

npm run format - format to prettier settings

# Unit Test Coverage Report

Ran 5/14 10:12 PM

> express-backend@1.0.0 test
> jest --verbose

 PASS  tests/users.test.js
  User Model Tests
  
    ✓ should create and save a user successfully (135 ms)
    
    ✓ should not save a user without required fields (2 ms)
    
    ✓ should find a user by email (10 ms)

 PASS  tests/restaurant.test.js
  Restaurant Model Tests
  
    ✓ should create and save a restaurant successfully (126 ms)
    
    ✓ should fail if required fields are missing (1 ms)
  
    ✓ should retrieve a restaurant by name (11 ms)
    
    ✓ should create a restaurant model dynamically for a city (90 ms)
    

---------------|---------|----------|---------|---------|-------------------
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
---------------|---------|----------|---------|---------|-------------------
All files      |     100 |      100 |     100 |     100 |                   
 restaurant.js |     100 |      100 |     100 |     100 |                   
 users.js      |     100 |      100 |     100 |     100 |                   
---------------|---------|----------|---------|---------|-------------------
Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        3.043 s
Ran all test suites.


