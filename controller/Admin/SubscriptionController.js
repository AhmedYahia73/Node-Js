import { Op } from 'sequelize';
import db from '../../models/index.js';
const { User } = db;

export const getSubscription = async (req, res) => {
  try {
    const subscribers = await User.findAll({
      where: {
        from: { [Op.lte]: now() },
        to: { [Op.gte]: now() }
      }
    });
    return res.status(200).json({ subscribers });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};