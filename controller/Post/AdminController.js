const { Admin } = require('../../models');
const Joi = require('joi');
import { Op } from "sequelize";
import bcrypt from "bcrypt"; // FIX: لازم تستورد bcrypt

export const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll(); // FIX: findAll بدل find (ده بتاع Mongoose)
    return res.status(200).json({ admins });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const admin_id = req.params.id;
    const admin = await Admin.findByPk(admin_id); // FIX: findByPk بدل findById
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    return res.status(200).json({ admin });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const create = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Name is required",
      "string.empty": "Name cannot be empty"
    }),
    password: Joi.string().min(6).required().messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
      "string.min": "Password must be at least 6 characters long"
    }),
    status: Joi.boolean().required().messages({
      "any.required": "Status is required",
      "boolean.base": "Status must be true or false"
    }),
    email: Joi.string().email().required().messages({
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
      "string.email": "Email must be a valid email address"
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map(e => e.message)
    });
  }

  try {
    let { name, email, password, status } = req.body;

    const exists = await Admin.findOne({ where: { email } }); // FIX: لازم where
    if (exists) {
      return res.status(400).json({ errors: ["Email already exists"] });
    }

    const salt = await bcrypt.genSalt(10); // FIX: hashing لازم قبل create
    password = await bcrypt.hash(password, salt);

    const admin = await Admin.create({
      name,
      email,
      password,
      status
    });

    return res.status(201).json({ success: "You create success" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const modify = async (req, res) => {
  const schema = Joi.object({ 
    password: Joi.string().min(6).messages({
      "string.min": "Password must be at least 6 characters long"
    }),
    status: Joi.boolean().messages({
      "boolean.base": "Status must be true or false"
    }),
    email: Joi.string().email().messages({
      "string.email": "Email must be a valid email address"
    })
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map(e => e.message)
    });
  }

  try {
    const { name, email, password, status } = req.body;
    const admin_id = req.params.id;

    const exists = await Admin.findOne({
      where: { email, id: { [Op.ne]: admin_id } } // FIX: لازم where
    });
    if (exists) {
      return res.status(400).json({ errors: ["Email already exists"] });
    }

    let admin_item = await Admin.findByPk(admin_id); // FIX: findByPk بدل findOne({id...})
    if (!admin_item) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (name) admin_item.name = name;
    if (email) admin_item.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin_item.password = await bcrypt.hash(password, salt);
    }
    if (typeof status !== "undefined") admin_item.status = status;

    await admin_item.save();

    return res.status(201).json({ success: "You update success" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}; 

export const delete_item = async (req, res) => {
  try {
    const admin_id = req.params.id;

    const deleted = await Admin.destroy({ where: { id: admin_id } }); // FIX: destroy بدل findByIdAndDelete
    if (!deleted) {
      return res.status(404).json({ error: "Admin not found" });
    }

    return res.status(200).json({
      success: "You delete data success"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
