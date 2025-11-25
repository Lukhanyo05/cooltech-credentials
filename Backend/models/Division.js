const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    organisationalUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganisationalUnit",
      required: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    credentials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Credential",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Division", divisionSchema);
