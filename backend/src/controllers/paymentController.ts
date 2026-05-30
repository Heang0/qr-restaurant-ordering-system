import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { BakongKHQR, khqrData, IndividualInfo } from 'bakong-khqr';
import QRCode from 'qrcode';
import { verifyBakongTransaction } from '../utils/bakong.js';

export const generateKHQR = async (req: Request, res: Response) => {
  try {
    const { storeId, amount: initialAmount, orderId, tableId } = req.body;
    
    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    let amount = parseFloat(initialAmount || '0');
    let billNumber = (orderId || `TBL-${tableId}`).replace(/-/g, '').slice(0, 25);

    // If tableId is provided but no amount, calculate the total from active orders
    if (tableId && amount === 0) {
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('total_price')
        .eq('store_id', storeId)
        .eq('table_id', tableId)
        .in('status', ['pending', 'preparing', 'ready']);
        
      if (activeOrders && activeOrders.length > 0) {
        amount = activeOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0);
      }
    }

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Fetch store Bakong info
    const { data: store, error } = await supabase
      .from('stores')
      .select('bakong_account_id, bakong_merchant_name, bakong_merchant_city')
      .eq('id', storeId)
      .single();

    if (error || !store) {
      return res.status(404).json({ message: 'Store not found or database error' });
    }

    if (!store.bakong_account_id || !store.bakong_merchant_name) {
      return res.status(400).json({ message: 'Store has not configured Bakong payment details' });
    }

    const relayToken = process.env.BAKONG_RELAY_TOKEN;
    if (!relayToken) {
      throw new Error('BAKONG_RELAY_TOKEN is missing');
    }

    const relayRes = await fetch('https://api.bakongrelay.com/v1/generate_qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${relayToken}`
      },
      body: JSON.stringify({
        account_id: store.bakong_account_id,
        merchant_name: store.bakong_merchant_name,
        merchant_city: store.bakong_merchant_city || 'Phnom Penh',
        amount: amount,
        currency: 'USD',
        bill_number: billNumber
      })
    });

    const response = await relayRes.json();

    if (response.responseCode !== 0 || !response.data) {
      throw new Error('Failed to generate KHQR string: ' + (response.responseMessage || JSON.stringify(response)));
    }

    const qrString = response.data.qr;
    const md5 = response.data.md5;

    if (!qrString) {
      throw new Error('QR string is undefined from BakongRelay');
    }

    // Generate QR Code image (base64)
    const qrImage = await QRCode.toDataURL(qrString);

    res.json({
      qrString,
      qrImage,
      md5,
      amount,
      merchantName: store.bakong_merchant_name
    });
  } catch (error: any) {
    console.error('KHQR generation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const verifyKHQR = async (req: Request, res: Response) => {
  try {
    const { md5 } = req.body;
    
    if (!md5) {
      return res.status(400).json({ message: 'MD5 hash is required' });
    }

    const isVerified = await verifyBakongTransaction(md5);
    
    if (!isVerified) {
      return res.status(400).json({ message: 'Payment not verified yet' });
    }

    res.json({ 
      status: 'success', 
      message: 'Transaction verified',
      md5
    });

  } catch (error: any) {
    console.error('KHQR verification error:', error);
    if (error.message === 'BAKONG_TOKEN_INVALID' || error.message === 'BAKONG_TOKEN_MISSING') {
      return res.status(500).json({ message: 'Server Configuration Error: Invalid Bakong Token' });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const generatePlanKhqr = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;
    const planType = req.body.planType || req.query.planType;
    
    const accountId = process.env.PLATFORM_BAKONG_ACCOUNT_ID;
    const merchantName = process.env.PLATFORM_BAKONG_MERCHANT_NAME || 'Platform';

    if (!accountId) {
      return res.status(500).json({ message: 'Platform Bakong Account ID is not configured' });
    }

    const relayToken = process.env.BAKONG_RELAY_TOKEN;
    if (!relayToken) {
      throw new Error('BAKONG_RELAY_TOKEN is missing');
    }

    const relayRes = await fetch('https://api.bakongrelay.com/v1/generate_qr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${relayToken}`
      },
      body: JSON.stringify({
        account_id: accountId,
        merchant_name: merchantName,
        merchant_city: 'Phnom Penh',
        amount: parseFloat(amount || '0.15'),
        currency: 'USD',
        bill_number: `SUB${planType === 'pro_max' ? 'PMAX' : 'PRO'}${Date.now()}`.slice(0, 25)
      })
    });

    const response = await relayRes.json();

    if (response.responseCode !== 0 || !response.data) {
      throw new Error('Failed to generate KHQR string: ' + (response.responseMessage || JSON.stringify(response)));
    }

    const qrString = response.data.qr;
    const md5 = response.data.md5;
    
    if (!qrString) {
      throw new Error('QR string is undefined from BakongRelay');
    }
    
    const qrImage = await QRCode.toDataURL(qrString);

    res.json({
      qrString,
      qrImage,
      md5,
      amount: parseFloat(amount || '0.15'),
      merchantName
    });
  } catch (error: any) {
    console.error('Plan KHQR generation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const verifyPlanKhqr = async (req: Request, res: Response) => {
  try {
    const { md5, storeId } = req.body;
    const planType = req.body.planType || req.query.planType || 'pro';
    
    if (!md5 || !storeId) {
      return res.status(400).json({ message: 'MD5 hash and storeId are required' });
    }

    const isVerified = await verifyBakongTransaction(md5);
    
    if (!isVerified) {
      return res.status(400).json({ message: 'Payment not verified yet' });
    }

    // Upgrade the store's plan in the database
    const targetPlan = planType === 'pro_max' ? 'pro_max' : 'pro';
    const { error: storeError } = await supabase
      .from('stores')
      .update({ plan: targetPlan })
      .eq('id', storeId);

    if (storeError) {
      console.error('Failed to update store plan:', storeError);
      return res.status(500).json({ message: `Failed to activate ${targetPlan} plan in database` });
    }

    res.json({ 
      status: 'success', 
      message: `Plan upgraded to ${targetPlan === 'pro_max' ? 'Pro Max' : 'Pro'}`,
      md5
    });

  } catch (error: any) {
    console.error('Plan KHQR verification error:', error);
    if (error.message === 'BAKONG_TOKEN_INVALID' || error.message === 'BAKONG_TOKEN_MISSING') {
      return res.status(500).json({ message: 'Server Configuration Error: Invalid Bakong Token' });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
