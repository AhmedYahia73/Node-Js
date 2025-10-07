import db from '../../models/index.js';
const { User, UserApp, BlockUser, Chat } = db;
import Joi from 'joi';
import { getCountry, getMap } from "../../utils/googleMap.js";
import {uploadBase64Image, deleteImage} from "../../utils/uploadBase64Image.js";

export const getProfile = async (req, res) => {
  const schema = Joi.object({
    page: Joi.number().required().messages({
      "any.required": "page_number is required",
      "number.base": "page_number must be number"
    }), 
  });

    if (!req.query) {
      return res.status(400).json({ errors: ['البيانات مطلوبة'] });
    }
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map(e => e.message)
    });
  }

  try {
    const user_id = req.user.id;
    const user = await User.findOne({
      id: user_id
    });
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().messages({
      "string.base": "name must be string"
    }), 
    bio: Joi.string().messages({
      "string.base": "bio must be string"
    }), 
    phone: Joi.string().messages({
      "string.base": "phone must be string"
    }), 
    image: Joi.string().messages({
      "string.base": "image must be string"
    }), 
  });

    if (!req.query) {
      return res.status(400).json({ errors: ['البيانات مطلوبة'] });
    }
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      errors: error.details.map(e => e.message)
    });
  }

  try {
    const user_id = req.user.id;
    let user = await User.findOne({
      id: user_id
    });
    if(user){
      const {name, bio, phone, image} = req.body;
      user.name = name ?? user.name;
      user.bio = bio ?? user.bio;
      user.phone = phone ?? user.phone;
      if(image){
        if (user.image) {
          try {
            await deleteImage(user.image);
          } catch (e) {
            console.warn("Image delete failed:", e.message);
          }
        }
        image = await uploadBase64Image(image, 'uploads/users');
        user.image = image;
      }
      user.save();
    }
    return res.status(200).json({ message: "You update profile success" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const startApp = async (req, res) => {
  const schema = Joi.object({
    longtuide: Joi.string().required().messages({
      "any.required": "longtuide is required",
      "string.base": "longtuide must be string"
    }), 
    latuide: Joi.string().required().messages({
      "any.required": "latuide is required",
      "string.base": "latuide must be string"
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
    const {longtuide, latuide} = req.body;
    let user = await User.findOne({"id" : req.user.id});
    user.longtuide = longtuide ?? user.longtuide;
    user.latuide = latuide ?? user.latuide;
    user.map = await getMap(latuide, longtuide) ?? user.map;
    user.country = await getCountry(latuide, longtuide) ?? user.latuide;
    user.save();
     
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};