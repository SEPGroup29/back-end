const Queue = require("../models/queueModel");
const PumpOperator = require("../models/pumpOperatorModel");
const Vehicle = require("../models/vehicleModel");
const VehicleOwner = require("../models/vehicleOwnerModel");
const FuelStation = require("../models/fuelStationModel");

const checkVehicleEligibility = async (req, res) => {
  const id = req.params.voId;
  const pumpOperatorUserId = req.params.poId;
  try {
    const vo = await VehicleOwner.findOne({ _id: id });
    const vehicles = await Vehicle.find({ vehicleOwnerId: vo._id }).populate(
      "vehicleType"
    );
    const po = await PumpOperator.findOne({ user: pumpOperatorUserId });
    const fsId = po.fuelStationId;
    const vehicleList = [];
    if (vehicles.length > 0) {
      for (const vehicle in vehicles) {
        if (vehicles[vehicle].eligibleFuel) {
          const registeredFuelQue = await Queue.findOne({
            _id: vehicles[vehicle].queueId,
          });
          const regFuelStation = await FuelStation.findOne({
            _id: registeredFuelQue.fuelStationId,
          });
          if (regFuelStation._id.toString() === fsId.toString()) {
            vehicleList.push(vehicles[vehicle]);
          }
        }
      }
      if (vehicleList.length > 0) {
        res.status(200).json({ vehicleList, result: "success" });
      } else {
        res.status(200).json({ error: "No eligible vehicles found" });
      }
    } else {
      res.status(200).json({ error: "No vehicles registered" });
    }
  } catch (error) {
    console.log(error);
  }
};

const pumpFuel = async (req, res) => {
  const { vehicleId, pumpOperatorId, fuelQuantity } = req.body;
  console.log(fuelQuantity);

  try {
    await Vehicle.update(
      { _id: vehicleId },
      {
        $set: {
          eligibleFuel: false,
          requestedFuel: 0,
          queueId: null,
          queuePosition: 0,
        },
      }
    );
    const vehicle = await Vehicle.findOne({ _id: vehicleId }).populate(
      "vehicleOwnerId"
    );

    const pumpOperator = await PumpOperator.findOne({ user: pumpOperatorId });

    console.log("pumpOperator", pumpOperator);
    const fuelStation = await FuelStation.findOne({
      _id: pumpOperator.fuelStationId,
    });
    if (vehicle.fuelType === "petrol") {
      const newConsumedPQ = vehicle.vehicleOwnerId.consumedPQ + fuelQuantity;
      await VehicleOwner.update(
        { _id: vehicle.vehicleOwnerId._id },
        { $set: { consumedPQ: newConsumedPQ } }
      );
      await FuelStation.update(
        { _id: pumpOperator.fuelStationId },
        { $set: { rpstock: fuelStation.rpstock - fuelQuantity } }
      );
    } else if (vehicle.fuelType === "diesel") {
      const newConsumedDQ = vehicle.vehicleOwnerId.consumedDQ + fuelQuantity;
      await VehicleOwner.update(
        { _id: vehicle.vehicleOwnerId._id },
        { $set: { consumedDQ: newConsumedDQ } }
      );
      await FuelStation.update(
        { _id: pumpOperator.fuelStationId },
        { $set: { rdstock: fuelStation.rdstock - fuelQuantity } }
      );
    } else {
      res.status(200).json({ error: "Something Went Wrong" });
      return;
    }

    res.status(200).json({ result: "success" });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  checkVehicleEligibility,
  pumpFuel,
};
