const authController = require("./authController");
const mongoose = require("mongoose");
const FuelStation = require("../models/fuelStationModel");
const FuelStationManager = require("../models/fuelStationManagerModal");
const { getCurrentUser } = require("../helpers/functions/getCurrentUser");
const PumpOperator = require("../models/pumpOperatorModel");
const ObjectId = require("mongoose").Types.ObjectId;
const Vehicle = require("../models/vehicleModel");
const Queue = require("../models/queueModel");
const { sendQueueMail } = require("../services/mail/queue_mail");
const VehicleOwner = require("../models/vehicleOwnerModel");
const { response } = require("express");

const insertFuelStation = async (req, res) => {
  const {
    name,
    nearCity,
    ownerName,
    mnFirstName,
    mnLastName,
    contactNumber,
    mnEmail,
  } = req.body;
  console.log({
    name,
    nearCity,
    ownerName,
    mnFirstName,
    mnLastName,
    contactNumber,
    mnEmail,
  });
  try {
    const result = await FuelStation.findOne({ name, nearCity });

    if (result) {
      res.status(200).json({ error: "Fuel station already exists" });
      return;
    }
    const fs = await FuelStation.create({ name, nearCity, ownerName });
    if (!fs) {
      res.status(200).json({ error: "Fuel station not created" });
      return;
    }
    const fs_manager = await authController.handleManagerSignup(
      name,
      nearCity,
      ownerName,
      mnFirstName,
      mnLastName,
      contactNumber,
      mnEmail,
      fs._id
    );
    if (!fs_manager) {
      res.status(200).json({ error: "Fuel station manager creation failed" });
      return;
    }
    res.status(200).json(fs_manager);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const showAllFuelStations = async (req, res) => {
  const { search } = req.params;
  try {
    if (search === "null") {
      var stations = await FuelStation.find().sort({ name: 1 });
      res.status(200).json({ stations, result: "success" });
    } else {
      var stations = await FuelStation.find({
        name: { $regex: search, $options: "i" },
      }).sort({ name: 1 });
      res.status(200).json({ stations, result: "success" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const showOneFuelStation = async (req, res) => {
  const { name } = req.params;
  try {
    const fs = await FuelStation.findOne({ name });
    res.status(200).json({ fs });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const showFuelStation = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    console.log("USER", user);
    if (!user) {
      res.status(200).json({ error: "User not found" });
      return;
    }
    const fs = await FuelStationManager.findOne({ user: user._id }).populate(
      "fuelStationId"
    );
    if (!fs) {
      res.status(200).json({ error: "Fuel station not found" });
      return;
    }
    const pumpOperators = await PumpOperator.find({
      fuelStationId: fs.fuelStationId.id,
    }).populate("user");
    res.status(200).json({ fs, pumpOperators });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getStock = async (req, res) => {
  const { fs_id } = req.params;
  if (ObjectId.isValid(fs_id)) {
    const station = await FuelStation.findOne({ _id: fs_id });
    if (station) {
      res
        .status(200)
        .json({ petrol: station.rpstock, diesel: station.rdstock });
    } else {
      res.status(200).json({ error: "Fuel station not found" });
    }
  } else {
    res.status(200).json({ error: "Fuel station not found" });
  }
};

const updateStock = async (req, res) => {
  const { fuel, amount, fuelStationId } = req.body;

  if (ObjectId.isValid(fuelStationId)) {
    const station = await FuelStation.findOne({ _id: fuelStationId });
    if (station) {
      var updatedStation;
      var result;
      switch (fuel) {
        case "Petrol":
          updatedStation = await FuelStation.updateOne(
            { _id: fuelStationId },
            {
              rpstock: parseFloat(station.rpstock) + amount,
              pstock:
                parseFloat(station.rpstock) + amount > station.pstock
                  ? parseFloat(station.rpstock) + amount
                  : station.pstock, // TODO:
              tempPetrolStock: parseFloat(station.rpstock) + amount,
            }
          );
          result = await updateQueue(fuel, fuelStationId);
          break;
        case "Diesel":
          updatedStation = await FuelStation.updateOne(
            { _id: fuelStationId },
            {
              rdstock: parseFloat(station.rdstock) + amount,
              dstock:
                parseFloat(station.rdstock) + amount > station.dstock
                  ? parseFloat(station.rdstock) + amount
                  : station.dstock, // TODO:
              tempDieselStock: parseFloat(station.rdstock) + amount,
            }
          );
          result = await updateQueue(fuel, fuelStationId);
          break;
        default:
          break;
      }
      console.log("RESULT", result);
      if (!result) {
        res.status(200).json({ error: "Queue updation failed" });
      }
      if (result.regulated) {
        res
          .status(200)
          .json({ updatedStation, success: "Queue regulated successfully" });
      }
      if (result.newQueue) {
        res.status(200).json({
          updatedStation,
          success: `New queues initiated successfully`,
        });
      }
    } else {
      res.status(200).json({ error: "Fuel station not found" });
    }
  } else {
    res.status(200).json({ error: "Fuel station not found" });
  }
};

// const getThreeFuelStations = async (req, res) => {
//     try {
//         // Get the count of all fuel stations
//         FuelStation.count().exec(function (err, count) {
//
//             // Get a random entry
//             var random = Math.floor(Math.random() * count)
//
//             // Again query all fuel stations but only fetch one offset by our random #
//             FuelStation.find().limit(3).skip(random).exec(
//                 function (err, result) {
//                     res.status(200).json({ result })
//                 })
//         })
//     } catch (error) {
//         res.status(400).json({ error: error.message })
//     }
// }

const getThreeFuelStations = async (req, res) => {
  try {
    const user = await getCurrentUser(req);
    const vehicleOwner = await VehicleOwner.findOne({ user: user._id });
    if (vehicleOwner.recentFuelStations) {
      const fuelStations = await FuelStation.find({
        _id: { $in: vehicleOwner.recentFuelStations },
      });
      res.status(200).json({ fuelStations });
    } else {
      res.status(200).json({ message: "No recent fuel stations found" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getQueueCount = async (req, res) => {
  console.log("INSIDE GET QUEUE COUNT");
  const { fuelStationId } = req.params;
  try {
    const petrolTokens = await countQ(fuelStationId, "petrol");
    const dieselTokens = await countQ(fuelStationId, "diesel");
    if (petrolTokens && dieselTokens) {
      console.log(petrolTokens, dieselTokens);
      res.status(200).json({ petrolTokens, dieselTokens });
    } else {
      res.status(200).json({ error: "Queue count failed" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const countQ = async (fuelStationId, queueType) => {
  try {
    const queue = await Queue.findOne({ fuelStationId, queueType });
    console.log(`${queueType} QUEUE`, queue);

    const allTokens = await Vehicle.countDocuments({ queueId: queue.id });
    const todayTokens = await Vehicle.countDocuments({
      queueId: queue.id,
      eligibleFuel: true,
    });
    return { allTokens, todayTokens };
  } catch (error) {
    return false;
  }
};

// ========================= Helper functions ===============================================

// Update the fuel queues whenever the stock is updated
const updateQueue = async (fuel, fuelStationId) => {
  try {
    const petrolQueue = await Queue.findOne({
      fuelStationId,
      queueType: "petrol",
    });
    const dieselQueue = await Queue.findOne({
      fuelStationId,
      queueType: "diesel",
    });
    var regulated, newQueue;
    if (petrolQueue) {
      // Deleting any eligible vehicle on previous day that didn't arrived
      await Vehicle.updateMany(
        { queueId: petrolQueue.id, eligibleFuel: true },
        {
          eligibleFuel: false,
          queueId: null,
          queuePosition: 0,
          requestedFuel: 0,
        }
      );

      // Make non eligible vehicles as eligible considering fuel quota
      regulated = await regulateQueue(fuelStationId, petrolQueue);
    } else {
      // Initiate the petrol queue
      newQueue = await Queue.create({ queueType: "petrol", fuelStationId });
    }
    if (dieselQueue) {
      // Deleting any eligible vehicle on previous day that are still stay as eligible
      await Vehicle.updateMany(
        { queueId: dieselQueue.id, eligibleFuel: true },
        {
          eligibleFuel: false,
          queueId: null,
          queuePosition: 0,
          requestedFuel: 0,
        }
      );

      // Make non eligible vehicles as eligible considering fuel quota
      regulated = await regulateQueue(fuelStationId, dieselQueue);
    } else {
      // Initiate the diesel queue
      newQueue = await Queue.create({ queueType: "diesel", fuelStationId });
    }

    return { regulated, newQueue };
  } catch (error) {
    return false;
  }
};

// Regulate queue if needed after the stock is updated
const regulateQueue = async (fuelStationId, queue) => {
  try {
    const nonEligibleVehicles = await Vehicle.find({
      queueId: queue.id,
      eligibleFuel: false,
    }).sort({ tempQueuePosition: 1 });
    let i = 1;

    // Make each uneligible vehicle eligible until stock limit exceeds
    for (const v of nonEligibleVehicles) {
      const station = await FuelStation.findOne({ _id: fuelStationId });
      const tempStock =
        queue.queueType === "petrol"
          ? station.tempPetrolStock
          : station.tempDieselStock; // Get real time stocks
      const ts =
        queue.queueType === "petrol" ? "tempPetrolStock" : "tempDieselStock"; // Get real time stocks
      if (tempStock >= v.requestedFuel) {
        const eligibled = await Vehicle.updateOne(
          { _id: v.id },
          {
            eligibleFuel: true,
            queuePosition: i,
            tempQueuePosition: 0,
          }
        );
        const updatedFs = await FuelStation.updateOne(
          { _id: fuelStationId },
          { [ts]: tempStock - v.requestedFuel }
        ); // Update with reduced stock
      } else {
        return true;
      }
      i += 1;
    }
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  insertFuelStation,
  showAllFuelStations,
  showOneFuelStation,
  getStock,
  updateStock,
  getThreeFuelStations,
  showFuelStation,
  getQueueCount,
};
