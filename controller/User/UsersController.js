import db from '../../models/index.js';
const { User, UserApp, BlockUser, Chat } = db;
import Joi from 'joi';
import { getCountry, getMap } from "../../utils/googleMap.js";
import mysql from "mysql2/promise";
import { Op } from "sequelize";

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
    const page = parseInt(req.query.page) || 1;
    const limit = 10; 
    const new_page = page - 1;
      // هات بيانات المستخدم الحالي
      const user = await User.findOne({ where: { id: user_id } });
      if (!user) return res.status(404).json({ message: "User not found" });

      const { latuide, longtuide, country, mute } = user;
    // User App
    let userApps = [];
    if(page == 1){
      // users_app من الجدول الثاني
      userApps = await UserApp.findAll({ where: { country } });
    }

     const userAppCount = await UserApp.count({ where: { country } });
    // حساب البداية والنهاية
    const startIndex = (new_page - 1) * limit + limit - userAppCount; 
    let real_users = [];
    // Real User
    if(page > 1){

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
        ORDER BY distance ASC
        LIMIT ? OFFSET ?`,
        {
          replacements: [latuide, longtuide, latuide, user_id, limit, startIndex],
          type: db.Sequelize.QueryTypes.SELECT
        }
      );

      real_users = await Promise.all(rows.map(async (item) => {
        const is_bloked = await BlockUser.findOne({
          where: {
            [Op.or]: [
              { user_id: user_id, friend_id: item.id },
              { user_id: item.id, friend_id: user_id }
            ]
          }
        });


        const msgs = await Chat.count({
          where: {
            sender_id: item.id, 
            receiver_id: user_id, 
            is_read: false  
          },
        });
        return {
          id: item.id,
          name: item.name,
          country: item.country,
          map: item.map,
          image: baseUrl + "/" + item.image,
          distance: item.distance ? item.distance.toFixed(2) + " Km" : "Unknown",
          is_bloked: !!is_bloked,
          msgs_not_read : msgs
        };
      }));
    }
    else if(limit > userApps.length){
      const new_limit = limit - userApps.length;
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
        ORDER BY distance ASC
        LIMIT ? OFFSET ?`,
        {
          replacements: [latuide, longtuide, latuide, user_id, new_limit, 0],
          type: db.Sequelize.QueryTypes.SELECT
        }
      );

      real_users = rows.map((item) => ({
        id: item.id,
        name: item.name,
        country: item.country,
        map: item.map,
        image: baseUrl + "/" + item.image,
        distance: item.distance.toFixed(2) + " Km",
      }));
    }

    const users_app = userApps.map((item) => ({
      id: item.id,
      name: item.name,
      country: item.country, 
      image: baseUrl + "/" + item.image,
      phone: item.phone,
    }));
    // 🟢 حساب عدد الصفحات
    const totalUsers = await User.count({ where: { id: { [Op.ne]: user_id } } });
    const totalUserApps = await UserApp.count({ where: { country } });
    const totalPages = Math.ceil((totalUsers + totalUserApps) / limit);
    // قصّ البيانات
    return res.status(200).json({ 
        users_app, 
        real_users, 
        totalPages,
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

export const chat = async (req, res) => {
  const schema = Joi.object({
    user_id: Joi.required().messages({
      "any.required": "user_id is required",
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
    const my_id = req.user.id;
    const user_id = req.body.user_id;
    await Chat.update(
      { is_read: true }, // القيم اللي هتتحدث
      {
        where: {
          sender_id: user_id,
          receiver_id: my_id,
        },
      }
    );


    const chats = await Chat.findAll({
      where: {
        [Op.or]: [
          { sender_id: my_id, receiver_id: user_id },
          { sender_id: user_id, receiver_id: my_id },
        ],
      },
      order: [['id', 'ASC']], // لو حابب الرسائل بالترتيب الزمني
    });

    const messages = chats.map((item) => ({
      message: item.message,
      deleted: item.deleted,
      is_read: item.is_read,
      i_sender: item.sender_id === my_id,
    }));

    return res.status(200).json({ messages });
 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}