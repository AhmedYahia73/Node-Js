import db from '../../models/index.js';
const { Paymob } = db;
import Joi from 'joi';

export const getPaymob = async (req, res) => {
  try { 
    const paymob = Paymob.findOne();
    return res.status(200).json({ paymob });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};export const updatePaymob = async (req, res) => {
  try {
    // جيب أول record
    let paymob = await Paymob.findOne();

    // لو لقيت record → التحديث
    if (paymob) {
      const schema = Joi.object({
        title: Joi.string(),
        type: Joi.string(),
        callback: Joi.string(),
        api_key: Joi.string(),
        iframe_id: Joi.string(),
        integration_id: Joi.string(),
        Hmac: Joi.string(),
      });

      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          errors: error.details.map(e => e.message)
        });
      }

      // تحديث الحقول اللي بعتها فقط
      Object.keys(req.body).forEach(key => {
        paymob[key] = req.body[key];
      });

      await paymob.save();
    } 
    // لو مفيش record → إنشاء جديد
    else {
      const schema = Joi.object({
        title: Joi.string().required(),
        type: Joi.string().required(),
        callback: Joi.string().required(),
        api_key: Joi.string().required(),
        iframe_id: Joi.string().required(),
        integration_id: Joi.string().required(),
        Hmac: Joi.string().required(),
      });

      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        return res.status(400).json({
          errors: error.details.map(e => e.message)
        });
      }

      paymob = await Paymob.create(req.body);
    }

    return res.status(200).json({ success: 'Data updated successfully', paymob });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
