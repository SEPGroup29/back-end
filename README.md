# FuelQ - The all new Fuel Queue Management and Token Issuer System in Sri Lanka.

![GitHub language count](https://img.shields.io/github/languages/count/SEPGroup29/back-end)
![GitHub top language](https://img.shields.io/github/languages/top/SEPGroup29/back-end)
![GitHub repo size](https://img.shields.io/github/repo-size/SEPGroup29/back-end)

![Logo](https://i.ibb.co/N9Hj5vd/Screenshot-2022-11-19-110117.png)

This system consists of a fuel quota generation system that issues a weekly fuel quota for each registered vehicle owner depending on the number of vehicles and their types, a queue management system where a user can select a fuel station and join a queue and get notified about the fuel arrivals and queue positions, a fuel stock management system to register fuel stations and update their fuel stocks and few other features. So, the system covers each and every section of fuel distribution focusing on managing fuel demand effectively and reducing the wastage of waiting time.

## Authors

- [@deshan](https://github.com/Deshan-Lakshitha)
- [@theshan](https://github.com/hesh-git)
- [@yasiru](https://github.com/yasirulakshan)

## Environmental variables that used for the backend server. (Need to create a .env file and place these variables in it)
 - DB_USERNAME='Database username'
 - DB_PASSWORD='Database password'
 - MONGO_URI='URI for the MongoDB Atlas database'
 - MONGO_URI_TEST='URI for the MongoDB test database'
 - PORT='Backend server runninng port'
 - MAIL_EMAIL="Email address of the system mail service"
 - MAIL_PASSWORD="App password for the system mail"
 - ACCESS_TOKEN_SECRET="Secret code for jwt access tokens"
 - REFRESH_TOKEN_SECRET="Secret code for jwt refresh tokens"
 - ADMIN=1
 - VEHICLE_OWNER=2
 - FUEL_STATION_MANAGER=3
 - PUMP_OPERATOR=4
 - OTP_LOGIN=1
 - PASSWORD_LOGIN=2

## Provided endpoints and functionalities
 - User CRUD operations
 - System CRUD operations
 - Daily updating functionality
 - Email services

## Technologies used
 - Express.js
 - NodeJS
 - MongoDB
 
## Requirements
 - NodeJS installed in the PC
 - MongoDB Atlas cloud database 
 
## Setup
 - Clone the Repository
 - Open a terminal in the project location and run `npm i` to install the dependencies
 - Add .env file with required variables
 - Run `nodemon server` to start the server
 
 ## Testing
  - Testing was done using Jest, Supertest & Mockingoose
  - Execute `npm test` command to run the tests
