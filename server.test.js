const mongoose = require("mongoose");
const { server } = require("./test_server");
require("dotenv").config();
const uri = process.env.MONGO_URI_TEST;
const Vehicle = require("./models/vehicleModel");
const supertest = require("supertest");
const FuelStation = require("./models/fuelStationModel");

beforeEach((done) => {
  mongoose.connect(uri, { useNewUrlParser: true }, () => done());
});

afterEach((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done());
  });
});

const app = server();

test("GET /users", async () => {
  const vehicle = await Vehicle.create({
    regNo: "CBB 3211",
    chassisNo: "678d097d98c34",
    vehicleType: "6331e8217f120e21a622b7e5",
    fuelType: "petrol",
  });

  await supertest(app)
    .get("/test/vehicle-owner/show-vehicle/CBB 3211")
    .expect(200)
    .then((response) => {
      // Check the response data
      expect(response.body.vehicle.regNo).toBe(vehicle.regNo);
    });
});

test("GET/fuelstation", async () => {
  const fStation = await FuelStation.create({
    name: "Mako Filling Station",
    nearCity: "Galle",
    ownerName: "Theshan",
    pstock: 50000,
    dstock: 50000,
    rpstock: 30000,
    rdstock: 20000,
  });

  await supertest(app)
    .get("/test/fuel-station/show-fuel-station/Mako Filling Station")
    .expect(200)
    .then((response) => {
      expect(response.body.fs.name).toBe(fStation.name);
    });
});


describe("POST /vehicle-owner-login", function () {
  it("Should return a user already exists", function (done) {
    supertest(app)
      .post("/auth/register-email-existance")
      .send({
        email: "geyibek621@klblogs.com",
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect({
        result: "Email already exists",
      })
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });
});

describe("POST /manager-login", function () {
  it("Should return a user already exists", function (done) {
    supertest(app)
      .post("/auth/fs-login")
      .send({
        "email":"managerone@gmail.com",
        "password":"Manager@123"
      })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        return done();
      });
  });
});
