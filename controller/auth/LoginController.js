const db = require('../../models/index.js');
const { Admin, User } = db;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { uploadBase64Image, deleteImage } = require("../../utils/uploadBase64Image.js");
const { getCountry, getMap } = require("../../utils/googleMap.js");
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const login = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required()
    });

    if (!req.body) {
      return res.status(400).json({ errors: ['البيانات مطلوبة'] });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }

    const { email, password } = req.body;
    const user = await Admin.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.status) return res.status(403).json({ message: 'User is banned' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, email: user.email, phone: user.phone, role: "Admin" },
      process.env.JWT_SECRET,
      { expiresIn: '7h' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};


const signup_google = async (req, res) => {
  try {
    const schema = Joi.object({
      token: Joi.string().required(),
      name: Joi.string().required(),
      longtuide: Joi.string().required(),
      latuide: Joi.string().required(),
      birth_date: Joi.date().required(),
      gender: Joi.string().required(),
      image: Joi.string().optional(),
      client_id: Joi.string().required()
    });

    if (!req.body) {
      return res.status(400).json({ errors: ['البيانات مطلوبة'] });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }

    let { token, name, longtuide, latuide, birth_date, gender, image, client_id } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client_id,
    });

    image = image ? await uploadBase64Image(image, 'uploads/userApp') : null;

    const payload = ticket.getPayload();
    const user = await User.findOne({ where: { email: payload['email'] } });

    if (user) {
      return res.status(400).json({ success: false, message: "المستخدم موجود بالفعل" });
    }

    const user_data = await User.create({
      name,
      longtuide,
      latuide,
      birth_date,
      gender,
      email: payload['email'],
      image: image,
      map: await getMap(latuide, longtuide),
      country: await getCountry(latuide, longtuide)
    });

    const accessToken = jwt.sign(
      { id: user_data.id, email: user_data.email, name: user_data.name, role: "User" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ accessToken, user_data });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired Google token", error: err.message });
  }
};


const login_user = async (req, res) => {
  try {
    const schema = Joi.object({
      client_id: Joi.string().required(),
      token: Joi.string().required(),
      longtuide: Joi.string().required(),
      latuide: Joi.string().required(),
    });

    if (!req.body) {
      return res.status(400).json({ errors: ['البيانات مطلوبة'] });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }

    let { token, longtuide, latuide, client_id } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: client_id,
    });

    const payload = ticket.getPayload();
    const user = await User.findOne({ where: { email: payload['email'] } });

    if (!user) {
      return res.status(400).json({ success: false, message: "You must signup first" });
    }

    user.longtuide = longtuide;
    user.latuide = latuide;
    user.map = await getMap(latuide, longtuide);
    user.country = await getCountry(latuide, longtuide);
    await user.save();

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: "User" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ accessToken, user_data: user });
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired Google token", error: err.message });
  }
};


module.exports = {
  login,
  signup_google,
  login_user
};
