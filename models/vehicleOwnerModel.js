const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const vehicleOwnerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  NIC: {
    type: String,
    required: true,
  },
  consumedPQ: {
    type: Number,
  },
  consumedDQ: {
    type: Number,
  },
  fuelQuota: {
    type: Schema.Types.ObjectId,
    ref: "FuelQuota",
  },
  recentFuelStations: {
    type: Array,
  },
});

const VehicleOwner = mongoose.model("VehicleOwner", vehicleOwnerSchema);

module.exports = VehicleOwner;
