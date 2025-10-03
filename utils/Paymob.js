        // Make Order
    
  
// utils/paymob.js
// مكتبة للتعامل مع Paymob API

import axios from "axios";
import db from '../models/index.js';
const { Payment } = db;

class PaymobService {

  // 1. الحصول على Token من Paymob
  async getToken(payment_method_auto) {
    try {
      const response = await axios.post(
        "https://accept.paymob.com/api/auth/tokens",
        {
          api_key: payment_method_auto.api_key,
        }
      );
      return response.data.token;
    } catch (err) {
      throw new Error("❌ Failed to get Paymob token: " + err.message);
    }
  }

  // 2. إنشاء أوردر جديد عند Paymob
  async createOrder(request, token, user) {
    const items = await this.makeOrder(request, user);

    if (items.errors && items.errors.length > 0) {
      return items;
    }

    const totalAmountCents = request.amount;

    const data = {
      auth_token: token,
      delivery_needed: "false",
      amount_cents: totalAmountCents,
      currency: "EGP",
      items: items.items,
    };

    try {
      const response = await axios.post(
        "https://accept.paymob.com/api/ecommerce/orders",
        data
      );

      // تحديث المعاملة (Transaction) داخل النظام
      const paymentId = items.payment.id;
      const orderId = response.data.id;
      await this.generateUniqueTransactionId(paymentId, orderId);

      return response.data;
    } catch (err) {
      throw new Error("❌ Failed to create Paymob order: " + err.message);
    }
  }

  // 3. إنشاء Payment Token (مفتاح الدفع) للعميل
  async getPaymentToken(user, totalAmount, order, token, payment_method_auto) {
    const billingData = {
      apartment: "45",
      email: user.email || "client@gmail.com",
      floor: "7",
      first_name: user.f_name || "client",
      street: "NA",
      building: "NA",
      phone_number: user.phone || "123",
      shipping_method: "NA",
      postal_code: "NA",
      city: "Alexandria",
      country: "Egypt",
      last_name: user.l_name || "2",
      state: "0",
    };

    const data = {
      auth_token: token,
      amount_cents: totalAmount,
      expiration: 3600,
      order_id: order.id, // ID الراجع من Paymob
      billing_data: billingData,
      currency: "EGP",
      integration_id: payment_method_auto.integration_id,
    };

    try {
      const response = await axios.post(
        "https://accept.paymob.com/api/acceptance/payment_keys",
        data
      );
      return response.data.token;
    } catch (err) {
      throw new Error("❌ Failed to get Payment Key: " + err.message);
    }
  }

  // 4. تحديث المعاملة ب Transaction ID من Paymob
  async generateUniqueTransactionId(paymentId, orderId) {
    const payment = await Payment.findByPk(paymentId);
    if (payment) {
      payment.transaction_id = orderId;
      await payment.save();
    }
    return payment;
  } 

  // 6. إنشاء الأوردر في DB و تجهيز بيانات Paymob
  async makeOrder(request, paymob = false) {
    // هنا بتجهز تفاصيل الأوردر و المنتجات
    const items = [{
      name: "VIP",
      amount_cents: request.amount,
      description: "Upgrade Chat Application toVIP",
      quantity: 1,
    }];

    // مثال: إنشاء أوردر جديد
    const payment = await Payment.create({
      user_id: request.user.id,
      amount: request.amount,
      status: false
    });
    return {
      payment: payment,
      orderItems: items,
      items: items,
    };
  }
}

export default PaymobService;