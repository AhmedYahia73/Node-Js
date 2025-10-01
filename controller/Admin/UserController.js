import { Op, Sequelize  } from 'sequelize';
import db from '../../models/index.js';
const { User } = db;
import Joi from 'joi';

export const getUsers = async (req, res) => {
  try { 
    
  const baseUrl = req.protocol + "://" + req.get("host");
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'birth_date', 'gender', 
        'birth_date', 'phone', 'country', 'status',
      
    [Sequelize.literal(`CONCAT('${baseUrl}/', image)`), 'image']
      ],
    });
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}; 

export const statusUser = async (req, res) => {
  const schema = Joi.object({ 
    status: Joi.boolean().required().messages({
      "any.required": "status is required",
      "boolean.base": "status must be a boolean" // الأفضل بدل number.empty
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
    let user = await User.findOne({id: user_id});
    if(user){
      user.status = req.body.status;
      await user.save();
    }
    else{
    return res.status(404).json({ error: 'id is wrong' });
    }
    return res.status(200).json({ 'success' : 'You change status success' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};