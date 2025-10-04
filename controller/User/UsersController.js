import db from '../../models/index.js';
const { User, UserApp } = db;
import Joi from 'joi';
import { getCountry, getMap } from "../../utils/googleMap.js";
import mysql from "mysql2/promise";

export const getUsers = async (req, res) => {
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
    const baseUrl = req.protocol + "://" + req.get("host");
    const user_id = req.user.id;

    // هات بيانات المستخدم الحالي
    const user = await User.findOne({ where: { id: user_id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { latuide, longtuide, country, mute } = user;

    // users من الجدول
   const rows = await db.sequelize.query(
      `SELECT 
          id, name, latuide, longtuide, image, country, map,
          (
              6371 * acos(
                  cos(radians(?)) * cos(radians(latuide)) * cos(radians(longtuide) - radians(?)) +
                  sin(radians(?)) * sin(radians(latuide))
              )
          ) AS distance
      FROM users
      WHERE id != ?
      ORDER BY distance ASC`,
      {
        replacements: [latuide, longtuide, latuide, user_id],
        type: db.Sequelize.QueryTypes.SELECT
      }
    );

    const real_users = rows.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      map: item.map,
      image: baseUrl + "/" + item.image,
      distance: item.distance.toFixed(2) + " Km",
    }));

    // users_app من الجدول الثاني
    const userApps = await UserApp.findAll({ where: { country } });

    const users_app = userApps.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country,
      map: null,
      image: baseUrl + "/" + item.image,
      distance: "0 Km",
    }));

    // دمج الاثنين
    const users = [...users_app, ...real_users];
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    // حساب البداية والنهاية
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // قصّ البيانات
    const paginatedUsers = users.slice(startIndex, endIndex);
    return res.status(200).json({ 
        data: paginatedUsers, 
        totalPages: Math.ceil(users.length / limit),
        app_is_mute: mute
     });
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