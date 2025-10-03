const { Admin } = require('../../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Joi = require('joi');
const uploadBase64Image = require('../../utils/uploadBase64Image');

const login = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': 'الإيميل غير صحيح',
        'any.required': 'الإيميل مطلوب',
      }),
      password: Joi.string().min(6).required().messages({
        'string.min': 'كلمة المرور لازم تكون 6 أحرف على الأقل',
        'any.required': 'كلمة المرور مطلوبة',
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
    const { email, password } = req.body;

    const user = await Admin.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if(!user.status)return res.status(404).json({ message: 'User is banned' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone },
      process.env.JWT_SECRET,     
      { expiresIn: '7h' }       
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}; 

module.exports = {
  login, 
};