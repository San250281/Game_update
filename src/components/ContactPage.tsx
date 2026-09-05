import React, { useState } from 'react';
import { 
  Mail, Send, CheckCircle2, Clock, ShieldCheck, 
  Copy, Check, HelpCircle, MessageSquare, AlertCircle, 
  Sparkles, ExternalLink, Headphones, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactPageProps {
  onNavigate?: (tab: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const SUPPORT_EMAIL = 'rewardyn1@gmail.com';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    priority: 'Normal',
    message: '',
    honeypot: '' // Anti-spam field
  });

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketId: string;
    submittedAt: string;
    subject: string;
    email: string;
    name: string;
    message: string;
  } | null>(null);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Please provide your full name or player handle.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please provide your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.message.trim()) {
      errors.message = 'Please provide the details of your inquiry.';
    } else if (formData.message.trim().length < 15) {
      errors.message = 'Message must be at least 15 characters long.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.honeypot) {
      // Bot detected, silently reject
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate fast-loading processing with realistic ticket generation
    setTimeout(() => {
      const ticketId = `RW-${Math.floor(100000 + Math.random() * 900000)}`;
      const newTicket = {
        ticketId,
        submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        subject: formData.subject,
        email: formData.email,
        name: formData.name,
        message: formData.message
      };

      setSubmittedTicket(newTicket);
      setIsSubmitting(false);

      // Save inquiry to localStorage for player reference
      try {
        const saved = JSON.parse(localStorage.getItem('rewardyn_inquiries') || '[]');
        saved.unshift({
          ...newTicket,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('rewardyn_inquiries', JSON.stringify(saved.slice(0, 10)));
      } catch (e) {
        console.error('Failed to cache inquiry ticket', e);
      }
    }, 600);
  };

  const generateMailtoHref = () => {
    const subject = encodeURIComponent(`[REWARDYN Inquiry] ${formData.subject}: ${formData.name || 'Player'}`);
    const body = encodeURIComponent(
      `Hello REWARDYN Support Team,\n\nName: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.subject}\nPriority: ${formData.priority}\n\nMessage:\n${formData.message}\n\n-- Sent via REWARDYN Contact Portal`
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const generateTicketMailtoHref = (ticket: typeof submittedTicket) => {
    if (!ticket) return `mailto:${SUPPORT_EMAIL}`;
    const subject = encodeURIComponent(`[Ticket #${ticket.ticketId}] ${ticket.subject} - ${ticket.name}`);
    const body = encodeURIComponent(
      `Hello REWARDYN Support Team,\n\nReference Ticket ID: #${ticket.ticketId}\nPlayer Name: ${ticket.name}\nContact Email: ${ticket.email}\nSubject: ${ticket.subject}\n\nInquiry Details:\n${ticket.message}\n\n--\nRecorded via REWARDYN Portal`
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setFormData({
      name: '',
      email: '',
      subject: 'General Inquiry',
      priority: 'Normal',
      message: '',
      honeypot: ''
    });
    setFormErrors({});
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-lg">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Headphones className="w-3.5 h-3.5" />
            <span>Player Support &amp; Inquiries</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white">
            Contact the REWARDYN Team
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-2.5 leading-relaxed">
            Have questions about your coin ledger, game rules, VIP membership, or partnership proposals?
            Reach out directly or send us an email at{' '}
            <button 
              onClick={handleCopyEmail}
              className="text-emerald-400 font-mono font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
            >
              {SUPPORT_EMAIL}
            </button>
            . We typically respond within 12–24 business hours.
          </p>
        </div>
      </div>

      {/* Quick Direct Inquiries & Email Card Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Direct Email Channel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Direct Email Inquiry</h3>
            <p className="text-xs text-slate-500 mt-1">Our dedicated support inbox for all questions, feedback, and partnerships.</p>
            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-xs text-slate-800">
              <span className="truncate">{SUPPORT_EMAIL}</span>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 hover:text-emerald-600 cursor-pointer shrink-0 ml-1"
                title="Copy email to clipboard"
                aria-label="Copy support email address"
              >
                {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('[REWARDYN] General Player Inquiry')}`}
            className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Compose Direct Email</span>
          </a>
        </div>

        {/* VIP Priority Support */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">VIP Member Concierge</h3>
            <p className="text-xs text-slate-500 mt-1">Expedited priority queue for VIP members regarding account perks and multiplier bonuses.</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Priority Response: Under 6 hours</span>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('membership')}
              className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>Explore VIP Membership</span>
            </button>
          )}
        </div>

        {/* Operating Hours & Fair Play */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Support Hours &amp; Security</h3>
            <p className="text-xs text-slate-500 mt-1">Monday – Saturday, 9:00 AM – 8:00 PM UTC. Automated monitoring runs 24/7/365.</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Verified Player Privacy Guarantee</span>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-slate-400 text-center font-medium">
            Zero telemetry selling • No spam guarantee
          </div>
        </div>
      </div>

      {/* Main Interactive Contact Form & Submission Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-150 gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Send an Inquiry Directly to rewardyn1@gmail.com
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Fill out the form below to generate a tracked inquiry ticket or draft a formatted message directly to our inbox.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              Live Inquiry Gateway
            </span>
          </div>
        </div>

        {/* Submitted Success Receipt Mode */}
        <AnimatePresence mode="wait">
          {submittedTicket ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-8 space-y-6 max-w-xl mx-auto text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono font-black tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  Ticket #{submittedTicket.ticketId} Created
                </span>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mt-3">
                  Thank You, {submittedTicket.name}!
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Your inquiry regarding <strong className="text-slate-850">"{submittedTicket.subject}"</strong> has been logged.
                  Our team reviews all incoming inquiries at <strong className="text-emerald-700 font-mono">{SUPPORT_EMAIL}</strong>.
                </p>
              </div>

              {/* Ticket Details Summary Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left text-xs space-y-2">
                <div className="flex justify-between border-b pb-1.5 border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Reference Number</span>
                  <span className="font-mono font-black text-slate-800">#{submittedTicket.ticketId}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Sender Email</span>
                  <span className="font-medium text-slate-800">{submittedTicket.email}</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Logged At</span>
                  <span className="text-slate-700">{submittedTicket.submittedAt}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Your Message</span>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 text-xs italic leading-relaxed">
                    "{submittedTicket.message}"
                  </p>
                </div>
              </div>

              {/* Action Buttons for User */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={generateTicketMailtoHref(submittedTicket)}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Direct Email Copy Now</span>
                </a>
                <button
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </motion.div>
          ) : (
            /* Interactive Contact Form */
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Spam protection honeypot */}
              <input
                type="text"
                name="website_url_honey"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Name or Handle <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    placeholder="e.g. Alex Hunter"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.name 
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/20' 
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 bg-slate-50/50'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Your Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                    }}
                    placeholder="e.g. alex@example.com"
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      formErrors.email 
                        ? 'border-red-400 focus:ring-red-200 bg-red-50/20' 
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 bg-slate-50/50'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Topic / Subject Category */}
                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-slate-50/50 text-xs text-slate-850 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="General Inquiry">General Question or Feedback</option>
                    <option value="VIP Membership & Billing">VIP Membership &amp; Perks</option>
                    <option value="Coin Ledger & Withdrawal Support">Coin Ledger &amp; Wallet Support</option>
                    <option value="Game Bug Report or Suggestion">Game Bug Report or New Game Suggestion</option>
                    <option value="Partnership & Sponsorship Proposal">Partnership, Game Developer, or Sponsorship</option>
                    <option value="Account Access & Recovery">Account Access &amp; Profile Switching</option>
                  </select>
                </div>

                {/* Priority Level */}
                <div>
                  <label htmlFor="contact-priority" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <select
                    id="contact-priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-slate-50/50 text-xs text-slate-850 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Normal">Normal (Standard inquiry — within 24 hours)</option>
                    <option value="High">High (Account/VIP issue — within 12 hours)</option>
                    <option value="Urgent">Urgent (Game blocking bug or payment)</option>
                  </select>
                </div>
              </div>

              {/* Message Area */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="contact-message" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Message Details <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formData.message.length} characters
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (formErrors.message) setFormErrors({ ...formErrors, message: '' });
                  }}
                  placeholder="Please describe your question or issue in detail. If you are reporting a game glitch, mention which game and what device/browser you are using."
                  className={`w-full px-4 py-3 rounded-xl border text-xs text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all resize-y ${
                    formErrors.message 
                      ? 'border-red-400 focus:ring-red-200 bg-red-50/20' 
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-100 bg-slate-50/50'
                  }`}
                />
                {formErrors.message && (
                  <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.message}
                  </p>
                )}
              </div>

              {/* Email destination pill reminder */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Target Inbox: <strong className="font-mono">{SUPPORT_EMAIL}</strong></span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">SSL Encrypted</span>
              </div>

              {/* Submission Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-400 text-center sm:text-left">
                  By submitting, you agree to our fair communication guidelines.
                </p>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  {/* Direct mailto shortcut button */}
                  <a
                    href={generateMailtoHref()}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Open your device's native mail client directly"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Email App</span>
                  </a>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Inquiry Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </AnimatePresence>
      </div>

      {/* Frequently Asked Questions Accordion / Quick Answers */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4.5 h-4.5 text-emerald-600" />
          Common Support Questions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <h4 className="font-black text-slate-800">How quickly does the support team reply?</h4>
            <p className="text-slate-500 leading-relaxed">
              Standard inquiries sent to <code className="text-emerald-700 bg-emerald-50 px-1 rounded">{SUPPORT_EMAIL}</code> receive responses within 12 to 24 hours. VIP members are prioritized and typically answered within 6 hours.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <h4 className="font-black text-slate-800">How do I report a bug or gameplay issue?</h4>
            <p className="text-slate-500 leading-relaxed">
              Select "Game Bug Report" in the form above and provide the game name along with your device type (desktop, tablet, or phone) and browser.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <h4 className="font-black text-slate-800">How do I upgrade to VIP Membership?</h4>
            <p className="text-slate-500 leading-relaxed">
              You can navigate to the VIP Membership tab in the menu to unlock all 8 exclusive member games and enjoy a 100% ad-free experience.
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1.5">
            <h4 className="font-black text-slate-800">Can I partner or publish games on REWARDYN?</h4>
            <p className="text-slate-500 leading-relaxed">
              Yes! We actively welcome HTML5 and TypeScript arcade developers and sponsorship partners. Send your pitch to <code className="text-emerald-700 bg-emerald-50 px-1 rounded">{SUPPORT_EMAIL}</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
