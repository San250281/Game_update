/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

interface SEOHeadProps {
  tab?: 'home' | 'lobby' | 'about' | 'services' | 'blog' | 'contact' | 'wallet' | 'referrals' | 'leaderboard' | 'membership' | 'admin';
  gameTitle?: string | null;
  gameCategory?: string | null;
  gameMaxReward?: number | null;
  isGuest?: boolean;
}

const BASE_URL = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://www.rewardyn.in';
const BRAND_NAME = 'REWARDYN';

export default function SEOHead({
  tab = 'home',
  gameTitle,
  gameCategory,
  gameMaxReward,
  isGuest
}: SEOHeadProps) {
  useEffect(() => {
    let pageTitle = '';
    let metaDescription = '';
    let hashTarget = '';

    if (gameTitle) {
      pageTitle = `Play ${gameTitle} Free Online - Win up to ${gameMaxReward || 100} Coins | ${BRAND_NAME}`;
      metaDescription = `Play ${gameTitle} (${gameCategory || 'Arcade'} Game) for free online on ${BRAND_NAME}. Challenge high scores, beat AI logic, and claim instant reward coin bonuses.`;
      hashTarget = `#game=${encodeURIComponent(gameTitle.toLowerCase().replace(/\s+/g, '-'))}`;
    } else {
      switch (tab) {
        case 'home':
          pageTitle = `${BRAND_NAME} - Play & Earn Web Arcade | 45+ Games & VIP Perks`;
          metaDescription = `Welcome to ${BRAND_NAME}. Play 45+ browser arcade and board games like Ludo, Chess, and Snake. Enjoy 100% ad-free play with VIP membership, instant guest pass, and digital rewards.`;
          hashTarget = '#home';
          break;
        case 'about':
          pageTitle = `About Us - The Story & Mission Behind ${BRAND_NAME}`;
          metaDescription = `Learn about ${BRAND_NAME}, our mission to revitalize browser arcade gaming with fast-loading web technology, fair-play mechanics, and transparent digital rewards.`;
          hashTarget = '#about';
          break;
        case 'services':
          pageTitle = `Services & Platform Solutions | ${BRAND_NAME} Arcade & VIP`;
          metaDescription = `Discover ${BRAND_NAME} services: instant browser arcade gaming, VIP ad-free memberships, dual-profile guest pass, competitive leaderboards, and developer partnerships.`;
          hashTarget = '#services';
          break;
        case 'blog':
          pageTitle = `Gaming Guides, Strategy & Platform News | ${BRAND_NAME} Blog`;
          metaDescription = `Read strategy guides for Grandmaster Chess and Royal Ludo, learn how to maximize daily coin streaks, and stay updated on ${BRAND_NAME} platform releases.`;
          hashTarget = '#blog';
          break;
        case 'contact':
          pageTitle = `Contact Us & Player Support | ${BRAND_NAME} (rewardyn1@gmail.com)`;
          metaDescription = `Get in touch with the ${BRAND_NAME} team at rewardyn1@gmail.com. Inquire about VIP memberships, game suggestions, partnership proposals, or account assistance.`;
          hashTarget = '#contact';
          break;
        case 'wallet':
          pageTitle = `Player Coin Wallet & Ledger Transactions | ${BRAND_NAME} Play & Earn`;
          metaDescription = `Check real-time coin ledger balances, withdrawal requests, and reward redemptions on ${BRAND_NAME}. Track all earned gaming tokens safely.`;
          hashTarget = '#wallet';
          break;
        case 'referrals':
          pageTitle = `Refer Friends & Earn Bonus Coins - Split Referral Program | ${BRAND_NAME}`;
          metaDescription = `Invite friends to ${BRAND_NAME}. Give friends starter bonus coins and earn referral bonuses when they register and play free online games.`;
          hashTarget = '#referrals';
          break;
        case 'leaderboard':
          pageTitle = `Arcade Leaderboard & Top Coin Champions | ${BRAND_NAME}`;
          metaDescription = `View top ranked players, daily tournament high scores, and arcade gaming legends on ${BRAND_NAME}. Climb to #1 and earn prestige badges.`;
          hashTarget = '#leaderboard';
          break;
        case 'membership':
          pageTitle = `VIP Membership - Exclusive Games & 100% Ad-Free Play | ${BRAND_NAME}`;
          metaDescription = `Upgrade to ${BRAND_NAME} VIP Membership to unlock 8 exclusive member-only games including Grandmaster Chess & Poker, enjoy a 100% ad-free experience, and get daily bonus coins.`;
          hashTarget = '#membership';
          break;
        case 'admin':
          pageTitle = `Staff Administrative Hub & Arcade Analytics | ${BRAND_NAME}`;
          metaDescription = `Administrative controls, token ledger audits, and system configuration for ${BRAND_NAME} arcade.`;
          hashTarget = '#admin';
          break;
        case 'lobby':
        default:
          pageTitle = `Play 45+ Free Online Arcade & Board Games | ${BRAND_NAME} Play & Earn`;
          metaDescription = `Explore 45+ free online browser games including Royal Ludo, Grandmaster Chess, Retro Snake, Tetris, Spin Wheel, and Quiz on ${BRAND_NAME}. No download required.`;
          hashTarget = '#games';
          break;
      }
    }

    // 1. Update Document Title
    document.title = pageTitle;

    // 2. Update Primary Meta Description
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (metaDescEl) {
      metaDescEl.setAttribute('content', metaDescription);
    }

    // 3. Update Open Graph Tags
    let ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (ogTitleEl) ogTitleEl.setAttribute('content', pageTitle);

    let ogDescEl = document.querySelector('meta[property="og:description"]');
    if (ogDescEl) ogDescEl.setAttribute('content', metaDescription);

    let ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (ogUrlEl) ogUrlEl.setAttribute('content', `${BASE_URL}/${hashTarget}`);

    // 4. Update Twitter Tags
    let twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleEl) twitterTitleEl.setAttribute('content', pageTitle);

    let twitterDescEl = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescEl) twitterDescEl.setAttribute('content', metaDescription);

    // 5. Update Canonical Tag
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) canonicalEl.setAttribute('href', `${BASE_URL}/${hashTarget}`);

    // 6. Update URL Hash without triggering reload
    if (typeof window !== 'undefined' && hashTarget) {
      const currentHash = (window.location.hash || '').toLowerCase();
      const isLobbyEquivalent = hashTarget === '#games' && (currentHash === '#games' || currentHash === '#lobby' || currentHash === '#play' || currentHash === '#faq');
      if (!isLobbyEquivalent && currentHash !== hashTarget.toLowerCase()) {
        window.history.replaceState(null, '', hashTarget);
      }
    }
  }, [tab, gameTitle, gameCategory, gameMaxReward, isGuest]);

  return null;
}
