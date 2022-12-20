//import mongoose from "mongoose";
const mongoose = require("mongoose");
var { Schema } = mongoose;
//const { createHmac } = await import("node:crypto");
const crypto = require("crypto");

const { v4: uuidv4 } = require("uuid");

// Has defined the architecture of the user database

var userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
      trim: true,
    },

    lastname: {
      type: String,
      maxlength: 32,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },

    userinfo: {
      type: String,
      trim: true,
    },

    //TO DO: COME BACK HERE

    encry_password: {
      type: String,
      required: true,
    },

    salt: String,

    role: {
      type: Number,
      default: 0,
    },

    purchases: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// Password encrypting method

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    // _describes the private variable
    this.salt = uuidv4();
    this.encry_password = this.securePassword(password);
  })

  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticate: function (plainpassword) {
    return this.securePassword(plainpassword) === this.encry_password;
  },

  securePassword: function (plainpassword) {
    if (!plainpassword) return "";
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(plainpassword)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
