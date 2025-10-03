import db from '../../models/index.js';
const { User, Subscription, Paymob, Payment } = db;
import Joi from 'joi';
import PaymobService from '../../utils/Paymob.js';
const paymob_obj = new PaymobService();
import crypto from "crypto";
import { Sequelize, Op } from "sequelize";

export const getdata = async (req, res) => {
  try {
    const user_id = req.user.id;
    const subscriper = await User.findOne({
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
        ],
        'id' : user_id
        }
    });
    let subscriper_status = false;
    let from = null; 
    let to = null; 
    if(subscriper){
        subscriper_status = true;
        from = subscriper.vip_from; 
        to = subscriper.vip_to; 
    }
    const subscription_amount = await Subscription.findOne(); 
    return res.status(200).json({ 
        subscriper_status,
        from,
        to,
        subscription_amount: subscription_amount?.amount,
     });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const payment = async (req, res) => {
  const schema = Joi.object({
    amount: Joi.number().required().messages({
      "any.required": "amount is required",
      "number.base": "amount must be number"
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
    const subscription_amount = await Subscription.findOne(); 
    if(subscription_amount?.amount != req.amount){
      return res.status(400).json({
        errors: "Amount is wrong"
      });
    }
    const user = await User.findOne({where: {"id" : req.user.id}}) ; 
    const paymentMethod = await Paymob.findOne();

    // 1. جيب التوكن
    const token = await paymob_obj.getToken(paymentMethod);

    // 2. اعمل الأوردر
    const orderResponse = await paymob_obj.createOrder(req.body, token, user);

    // 3. جيب Payment Key
    const paymentToken = await paymob_obj.getPaymentToken(
      user,
      req.body.amount,
      orderResponse,
      token,
      paymentMethod
    );
    const paymentLink = `https://accept.paymob.com/api/acceptance/iframes/${paymentMethod.iframe_id}?payment_token=${paymentToken}`;

    res.json({ paymentLink });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
 
export const paymobCallback = async (req, res) => {
  try {
    // 1. الحصول على بيانات طريقة الدفع (نفترض أنها موجودة في DB)
    const paymentMethod = await Paymob.findOne();

    if (!paymentMethod) {
      return res.status(400).json({ error: "Payment method not found" });
    }

    // 2. بيانات الراجعة من Paymob
    const data = req.body;
    const hmacFromPaymob = data.hmac;

    // 3. ترتيب الحقول زي ما بيطلب Paymob
    const keysArray = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "id",
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refunded",
      "is_standalone_payment",
      "is_voided",
      "order",
      "owner",
      "pending",
      "source_data_pan",
      "source_data_sub_type",
      "source_data_type",
      "success",
    ];

    let connectedString = "";
    for (const key of keysArray) {
      if (data[key] !== undefined) {
        connectedString += data[key];
      }
    }

    // 4. حساب HMAC
    const secret = paymentMethod.hmac; // الـ HMAC Secret من DB
    const calculatedHmac = crypto
      .createHmac("sha512", secret)
      .update(connectedString)
      .digest("hex");

    if (calculatedHmac !== hmacFromPaymob) {
      return res.status(400).json({ error: "Invalid HMAC" });
    }

    // 5. لو الدفع ناجح
    if (data.success === true || data.success === "true") {
        let paymob = await Payment.findOne({where: {transaction_id: data.order}});
        paymob.status = true;
        await paymob.save();
        let now = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(now.getMonth() + 1);
        let user_data = await User.findOne({where: {id: paymob.user_id}});
        user_data.vip = true;
        user_data.vip_from = now;
        user_data.vip_to = nextMonth;
        await user_data.save();
      
        return res.status(200).json({ message: "Payment success" });
    } else {
      // فشل الدفع 

      return res.status(400).json({ error: "Payment failed" });
    }
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};