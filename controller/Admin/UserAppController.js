import db from '../../models/index.js';
const { UserApp } = db;
import Joi from 'joi';
import { Op } from "sequelize";
import bcrypt from "bcrypt";
import {uploadBase64Image, deleteImage} from "../../utils/uploadBase64Image.js";
import {getCountry, getMap} from "../../utils/googleMap.js";

export const getUserApps = async (req, res) => {
  try {
    const UserApps = await UserApp.findAll();
    return res.status(200).json({ UserApps });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const UserApp_id = req.params.id;
    const UserApp = await UserApp.findByPk(UserApp_id); // FIX: findByPk بدل findById
    if (!UserApp) return res.status(404).json({ error: "UserApp not found" });
    return res.status(200).json({ UserApp });
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
    image: Joi.string().messages({
      "string.base": "Image must be base64",
    }),
    longtuide: Joi.string().required().messages({
      "any.required": "longtuide is required",
    }),
    latuide: Joi.string().required().messages({
      "any.required": "latuide is required",
    }),
    phone: Joi.string().required().messages({
      "any.required": "phone is required",
    }), 
  });

  if (!req.body) {
    return res.status(400).json({ errors: ['البيانات مطلوبة'] });
  }
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map(e => e.message)
    });
  }

  try {
    let { name, image, longtuide, latuide, phone } = req.body;

    const exists = await UserApp.findOne({ where: { phone } }); // FIX: لازم where
    if (exists) {
      return res.status(400).json({ errors: ["Phone already exists"] });
    }

    image = await uploadBase64Image(image, 'uploads/userApp');
    const user_app = await UserApp.create({
      name,
      longtuide,
      latuide,
      phone,
      image,
      map: await getMap(latuide, longtuide),
      country: await getCountry(latuide, longtuide)
    });

    return res.status(201).json({ success: "You create success" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const modify = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().messages({
      "string.base": "Name must be string"
    }),
    image: Joi.string().messages({
      "string.base": "Image must be base64",
    }),
    longtuide: Joi.string().messages({
      "string.base": "longtuide must be string",
    }),
    latuide: Joi.string().messages({
      "string.base": "latuide must be string",
    }),
    phone: Joi.string().messages({
      "string.base": "phone must be string",
    }), 
  });

  if (!req.body) {
    return res.status(400).json({ errors: ['البيانات مطلوبة'] });
  }
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map(e => e.message)
    });
  }

  try {
    let { name, image, longtuide, latuide, phone } = req.body;
    const UserApp_id = req.params.id;

    if(phone){
      const exists = await UserApp.findOne({
        where: { phone, id: { [Op.ne]: UserApp_id } } // FIX: لازم where
      });
      if (exists) {
        return res.status(400).json({ errors: ["Phone already exists"] });
      }
    }

    let UserApp_item = await UserApp.findByPk(UserApp_id); // FIX: findByPk بدل findOne({id...})
    if (!UserApp_item) {
      return res.status(404).json({ error: "UserApp not found" });
    }

    if (name) UserApp_item.name = name;
    if (longtuide) UserApp_item.longtuide = longtuide;
    if (latuide) UserApp_item.latuide = latuide;
    if (phone) UserApp_item.phone = longtuide;
    if (image){
      if (UserApp_item.image) {
        try {
          await deleteImage(UserApp_item.image);
        } catch (e) {
          console.warn("Image delete failed:", e.message);
        }
      }
      image = await uploadBase64Image(image, 'uploads/userApp');
      UserApp_item.image = image;
    }

    UserApp_item.map = await getMap(UserApp_item.latuide, UserApp_item.longtuide),
    UserApp_item.country = await getCountry(UserApp_item.latuide, UserApp_item.longtuide)
    await UserApp_item.save();

    return res.status(201).json({ success: "You update success" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}; 

export const delete_item = async (req, res) => {
  try {
    const UserApp_id = req.params.id;

    const UserApp_item = await UserApp.findByPk(UserApp_id);
    if (!UserApp_item) {
      return res.status(404).json({ error: "UserApp not found" });
    }
    if (UserApp_item.image) {
      try {
        await deleteImage(UserApp_item.image, 'userApp');
      } catch (e) {
        console.warn("Image delete failed:", e.message);
      }
    }
    await UserApp_item.destroy();

    return res.status(200).json({
      success: "You delete data success"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
