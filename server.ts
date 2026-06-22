/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory server-side stats tracking
  const stats = {
    totalUsers: 14205,
    paidUsers: 843,
    totalRevenueINR: 198420,
    membershipRevenueINR: 125609,
    surveyRevenueINR: 42100,
    affiliateRevenueINR: 18450,
    campaignRevenueINR: 12261,
    clicksLogged: 4894,
    surveysCompleted: 1045,
    giftCardsRedeemed: 320,
  };

  // Seed Admin actions log
  const adminLogs = [
    { id: 'l_1', admin: 'system', action: 'System startup initialized', timestamp: new Date().toISOString() },
    { id: 'l_2', admin: 'san250281@gmail.com', action: 'Approved Flipkart ₹100 Gift Card for userUID_5', timestamp: new Date().toISOString() },
  ];

  // System Settings
  const systemSettings = {
    fraudThresholdDailyClicks: 100,
    minRedeemLimitCoins: 5000,
    referralBonusReferrer: 100,
    referralBonusFriend: 50,
    maintenanceMode: false,
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Get Admin Portal Metrics
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    res.json({
      success: true,
      stats,
      settings: systemSettings,
      logs: adminLogs,
    });
  });

  // Post Admin Action Log
  app.post('/api/admin/log', (req: Request, res: Response) => {
    const { admin, action } = req.body;
    const logItem = {
      id: 'l_' + Math.random().toString(36).substr(2, 9),
      admin: admin || 'Admin',
      action: action || 'Triggered custom parameter adjustment',
      timestamp: new Date().toISOString(),
    };
    adminLogs.unshift(logItem);
    res.json({ success: true, log: logItem });
  });

  // Update Settings from Admin Portal
  app.post('/api/admin/settings', (req: Request, res: Response) => {
    const { fraudThresholdDailyClicks, minRedeemLimitCoins, referralBonusReferrer, referralBonusFriend, maintenanceMode } = req.body;
    if (typeof fraudThresholdDailyClicks === 'number') systemSettings.fraudThresholdDailyClicks = fraudThresholdDailyClicks;
    if (typeof minRedeemLimitCoins === 'number') systemSettings.minRedeemLimitCoins = minRedeemLimitCoins;
    if (typeof referralBonusReferrer === 'number') systemSettings.referralBonusReferrer = referralBonusReferrer;
    if (typeof referralBonusFriend === 'number') systemSettings.referralBonusFriend = referralBonusFriend;
    if (typeof maintenanceMode === 'boolean') systemSettings.maintenanceMode = maintenanceMode;

    res.json({ success: true, settings: systemSettings });
  });

  // 1. RAZORPAY PAYMENT SYSTEM (Simulation)
  // Create virtual Razorpay Order
  app.post('/api/payments/order', (req: Request, res: Response) => {
    const { userId, planId, priceINR } = req.body;
    if (!userId || !planId || !priceINR) {
       res.status(400).json({ success: false, error: 'Missing required parameters: userId, planId, priceINR' });
       return;
    }

    const orderId = 'order_' + Math.random().toString(36).substr(2, 12).toUpperCase();
    res.json({
      success: true,
      orderId,
      amount: priceINR * 100, // Paise
      currency: 'INR',
      key: 'rzp_test_arena' + Math.random().toString(36).substr(2, 5).toUpperCase(),
    });
  });

  // Verify Virtual Signature
  app.post('/api/payments/verify', (req: Request, res: Response) => {
    const { paymentId, orderId, signature, userId, planId, priceINR, coinsBonus } = req.body;
    if (!paymentId || !orderId || !userId || !planId) {
       res.status(400).json({ success: false, error: 'Payment verification failed due to missing credentials' });
       return;
    }

    // Capture revenue
    stats.totalRevenueINR += Number(priceINR);
    stats.membershipRevenueINR += Number(priceINR);
    stats.paidUsers += 1;

    // Log admin action
    adminLogs.push({
      id: 'l_' + Math.random().toString(36).substr(2, 9),
      admin: 'Razorpay Gateway',
      action: `Processed payment of ₹${priceINR} for user ${userId} (Plan: ${planId})`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Signature verified successfully. Membership active.',
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 12),
    });
  });

  // 2. SURVEY CPX/BITLABS CALLBACKS (Postback URLs)
  // Format: APP_URL/api/surveys/callback?userId={userId}&provider={provider}&surveyId={surveyId}&coins={coins}&sig={sig}
  app.get('/api/surveys/callback', (req: Request, res: Response) => {
    const { userId, provider, surveyId, coins } = req.query;

    if (!userId || !provider || !surveyId || !coins) {
       res.status(400).send('ERROR: Missing parameter queries');
       return;
    }

    const coinsEarned = parseInt(coins as string, 10);
    stats.surveysCompleted += 1;
    // Assume surveys pay out approx ₹0.04 per coin on average from provider
    const estimatedPayoutINR = Math.round(coinsEarned * 0.04);
    stats.totalRevenueINR += estimatedPayoutINR;
    stats.surveyRevenueINR += estimatedPayoutINR;

    // Record Log
    adminLogs.push({
      id: 'l_' + Math.random().toString(36).substr(2, 9),
      admin: `${provider} Callback`,
      action: `Credited user ${userId} with ${coinsEarned} game coins for survey ID ${surveyId}`,
      timestamp: new Date().toISOString(),
    });

    res.send('OK'); // Return standard text code for provider success acknowledgment
  });

  // 3. AFFILIATE REDIRECTS CLICK TRACKING
  app.get('/api/affiliates/click/:id', (req: Request, res: Response) => {
    const offerId = req.params.id;
    const userId = req.query.userId || 'guest';

    stats.clicksLogged += 1;
    stats.totalRevenueINR += 5; // Flat estimated clicking bonus in INR
    stats.affiliateRevenueINR += 5;

    res.json({
      success: true,
      offerId,
      userId,
      trackedId: 'click_aff_' + Math.random().toString(36).substr(2, 12),
      timestamp: new Date().toISOString(),
    });
  });

  // 4. ADVERTISER PROMOTION CAMPAIGNS CLICK TRACKING
  app.post('/api/campaigns/click', (req: Request, res: Response) => {
    const { userId, campaignId, actionCoins } = req.body;

    if (!userId || !campaignId) {
       res.status(400).json({ success: false, error: 'Missing userId or campaignId' });
       return;
    }

    stats.clicksLogged += 1;
    stats.campaignRevenueINR += 2; // Flat 2 INR advertiser charge per verified click
    stats.totalRevenueINR += 2;

    res.json({
      success: true,
      userId,
      campaignId,
      coinsEarned: actionCoins || 10,
      timestamp: new Date().toISOString(),
    });
  });

  // 5. GIFT CARD ISSUING PROCESSOR
  app.post('/api/giftcards/process', (req: Request, res: Response) => {
    const { redemptionId, status, brand } = req.body;
    if (!redemptionId || !status) {
       res.status(400).json({ success: false, error: 'Missing parameter specs' });
       return;
    }

    const claimCode = (brand || 'AMZN') + '-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
    const claimPin = Math.floor(100000 + Math.random() * 900000).toString();

    stats.giftCardsRedeemed += 1;

    adminLogs.push({
      id: 'l_' + Math.random().toString(36).substr(2, 9),
      admin: 'san250281@gmail.com',
      action: `Processed Gift Card redemption ${redemptionId} (${status})`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      status: status === 'Approved' ? 'Delivered' : status,
      giftCode: claimCode,
      giftPin: claimPin,
      deliveredDate: new Date().toISOString(),
    });
  });

  // --- DEV & PRODUCTION FALLBACK ROUTING ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RewardArena] Full-stack server active at http://localhost:${PORT}`);
  });
}

startServer();
