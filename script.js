import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import {
  ADD,
  ALL_DETAILS,
  DELETE,
  DETAILS_BY_ID,
  UPDATE,
} from "./API_Endpoints.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/employeeDB");
}

const employeeSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  name: String,
  email: {
    type: String,
    unique: true,
  },
  sal: Number,
  phoneNo: {
    type: Number,
    unique: true,
  },
});

const Employee = mongoose.model("Employee", employeeSchema);

app.put(UPDATE, async (req, res) => {
  const params = Object.keys(req.body);
  const allowedMethods = ["id", "name", "email", "sal", "phoneNO"];
  const isValidOperation = params.every((param) =>
    allowedMethods.includes(param)
  );

  if (!isValidOperation) {
    res.send({
      status: false,
      msg: "invalid Schema of details sent!",
    });
  } else {
    const payload = req.body;
    const reqEmp = await Employee.findOne({ id: req.body.id });
    if (reqEmp) {
      const reqEmpKeys = Object.entries(reqEmp);
      const actualKeys = Object.keys(reqEmpKeys[2][1]).splice(1);
      actualKeys.pop();
      console.log(actualKeys);
      actualKeys.forEach((key) => {
        if (!payload[key]) {
          payload[key] = reqEmp[key];
        }
      });
      await Employee.findOneAndReplace({ id: payload.id }, payload, {
        new: true,
      })
        .then((resp) => {
          res.send({
            status: true,
            msg: "Entry Updated!",
          });
        })
        .catch((err) => {
          res.send({
            status: false,
            msg: "Entry Not Updated!",
          });
        });
    } else {
      res.send({
        status: false,
        msg: "Entry Not Found!",
      });
    }
  }
});

app.delete(DELETE, async (req, res) => {
  const result = await Employee.findOneAndDelete({ id: req.params.id });
  if (result) {
    res.send({
      status: true,
      msg: "Entry Deleted!",
      response: resp,
    });
  } else {
    res.send({
      status: false,
      msg: "Entry Not Found!",
    });
  }
});

app.post(ADD, async (req, res) => {
  const employee = new Employee(req.body);
  await employee
    .save()
    .then((resp) => {
      res.send({
        status: true,
        msg: "User Added!",
      });
    })
    .catch((err) => {
      res.send({
        status: false,
        msg: "User Not Added!, Duplicate Entry Found or Invalid Schema!",
        error: err,
      });
    });
});

app.get(DETAILS_BY_ID, async (req, res) => {
  const recObj = await Employee.findOne({ id: req.params.id });
  if (recObj) {
    res.send({
      status: true,
      msg: "Record Found!",
      data: recObj,
    });
  } else {
    res.send({
      status: false,
      msg: "Record Not Found!",
    });
  }
});

app.get(ALL_DETAILS, async (req, res) => {
  await Employee.find()
    .then(async (resp) => {
      res.send({
        status: true,
        msg: "Collection Exist",
        data: await Employee.find(),
      });
    })
    .catch(async (err) => {
      res.send({
        status: false,
        msg: "Data not Found or Collection Doesent Exist!   ",
        error: err,
      });
    });
});

app.listen(PORT, () => {
  console.log(`Working on PORT: ${PORT}`);
});
