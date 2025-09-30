// apps/web/src/components/pages/SupportPage.tsx
import React, { useState } from 'react'
import '../../styles/SupportPage.css'

function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for submit logic
    alert('Message sent!');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="support-page">
      <h1>Customer Support</h1>

      <div className="help-section">
        <h2>How can we help you?</h2>
        <div className="help-options">
          <div className="option">
            <span className="icon">○</span>
            <p>Live Chat</p>
          </div>
          <div className="option">
            <span className="icon">📞</span>
            <p>Call Support</p>
          </div>
          <div className="option">
            <span className="icon">○</span>
            <p>Report Issue</p>
          </div>
          <div className="option">
            <span className="icon">★</span>
            <p>Leave Feedback</p>
          </div>
        </div>
      </div>

      <div className="contact-section">
        <h2>Contact Information</h2>
        <div className="contact-options">
          <div className="contact-item">
            <span className="icon">📞</span>
            <p>Phone Support<br />(555) 123-FOOD</p>
          </div>
          <div className="contact-item">
            <span className="icon">💬</span>
            <p>Live Chat<br />Available now<br />Response time: ~2 min</p>
          </div>
        </div>
      </div>

      <div className="notifications-section">
        <h2>Recent Notifications</h2>
        <div className="notifications">
          <p>Your order is being prepared!</p>
          <p>New offers available!</p>
        </div>
      </div>

      <div className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item">
          <h3>How long does delivery take?</h3>
          <p>Most orders are delivered within 30-45 minutes, depending on your location and restaurant preparation time.</p>
        </div>
        <div className="faq-item">
          <h3>Can I modify my order after placing it?</h3>
          <p>You can modify your order within 5 minutes of placing it. After that, please contact the restaurant directly.</p>
        </div>
        <div className="faq-item">
          <h3>What if my order is incorrect?</h3>
          <p>Contact our support team immediately and we'll work with the restaurant to resolve the issue or provide a refund.</p>
        </div>
        <div className="faq-item">
          <h3>How do I cancel my order?</h3>
          <p>You can cancel your order before the restaurant starts preparing it. Check your order status and use the cancel button if available.</p>
        </div>
      </div>

      <div className="message-section">
        <h2>Send us a message</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Subject" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <textarea 
            placeholder="Describe your issue or feedback..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  )
}

export default SupportPage