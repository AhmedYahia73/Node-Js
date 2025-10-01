import { Op, Sequelize  } from 'sequelize';
import db from '../../models/index.js';
const { User, Subscription } = db;
import Joi from 'joi';

export const getSubscriper = async (req, res) => {
  try { 
    const subscripers = await User.findAll({
      attributes: ['id', 'name', 'email', 'birth_date', 'vip_from', 'vip_to', 'status'],
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn("DATE", Sequelize.col("vip_from")),
            { [Op.lte]: Sequelize.fn("CURDATE") }
          ),
          Sequelize.where(
            Sequelize.fn("DATE", Sequelize.col("vip_to")),
            { [Op.gte]: Sequelize.fn("CURDATE") }
          )
        ]
      }
    });
    return res.status(200).json({ subscripers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateSubscriper = async (req, res) => {
    const schema = Joi.object({ 
    status: Joi.boolean().required().messages({
      "any.required": "status is required",
      "boolean.base": "status must be a boolean"
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
    const user_id = req.params.id; 
    const [updated] = await User.update(
      { status: req.body.status },
      { where: { id: user_id } }
    );
    return res.status(200).json({ 'success' : 'You update data success' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      attributes: ['amount']
    });

    return res.status(200).json({ subscription });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateSubscription = async (req, res) => {
  const schema = Joi.object({ 
    amount: Joi.number().required().messages({
      "any.required": "amount is required",
      "number.base": "amount must be a number" // الأفضل بدل number.empty
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
    let subscription = await Subscription.findOne();
    if(subscription){
      subscription.amount = req.body.amount;
      await subscription.save();
    }
    else{
      subscription = await Subscription.create({
        'amount' : req.body.amount
      });
    }
    return res.status(200).json({ subscription });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};