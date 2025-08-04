const { User, Comment } = require('../../models');
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
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

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

const comments = async (req, res, next) => {
  try {
    const user_comments = await User.findByPk(req.user.id, {
      include: [
        {
          model: Comment,
          attributes: ['id', 'title'],
        },
      ],
    });

    if (!user_comments) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    return res.status(200).json({
      user_comments: user_comments.Comments // لو عايز ترجع التعليقات فقط
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'حدث خطأ أثناء جلب التعليقات', error: err.message });
  }
};


const uploadImageController = async (req, res) => {
    const schema = Joi.object({
      image: Joi.string().required().messages({ 
        'any.required': 'image is required',
      }), 
    });
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }
  try {
    const { image } = req.body;

    const fileName = await uploadBase64Image(image);

    res.json({ message: 'you upload image success', file: fileName });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  login,
  comments,
  uploadImageController,
};