const mongoose = require("mongoose")
const { server } = require("./test_server")
require('dotenv').config();
const uri = process.env.MONGO_URI
const Vehicle = require('./models/vehicleModel');
const supertest = require("supertest");

beforeEach((done) => {
    mongoose.connect(
        uri,
        { useNewUrlParser: true },
        () => done()
    )
})

afterEach((done) => {
    mongoose.connection.db.dropDatabase(() => {
        mongoose.connection.close(() => done())
    })
})

const app = server()

test("GET /users", async () => {
    const vehicle = await Vehicle.create({
        regNo:"CBB 3211", 
        chassisNo:"678d097d98c34", 
        vehicleType:"6331e8217f120e21a622b7e5", 
        fuelType:"petrol"
    })

    await supertest(app)
        .get("/test/vehicle-owner/show-vehicle/CBB 3211")
        .expect(200)
        .then((response) => {
            // Check the response data
            expect(response.body.vehicle.regNo).toBe(vehicle.regNo)
        })
})