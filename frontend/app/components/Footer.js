"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>🕉️ Sacred Texts Library</h3>
          <p>
            Explore the timeless wisdom of ancient scriptures including Vedas,
            Upanishads, Bhagavad Gita, and more.
          </p>
          <p className="footer-tagline">
            प्राचीन ग्रंथों की शाश्वत ज्ञान का अन्वेषण करें
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link href="/">Home / होम</Link>
            </li>
            <li>
              <Link href="/#categories">Categories / श्रेणियाँ</Link>
            </li>
            <li>
              <Link href="/#about">About / परिचय</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Categories</h4>
          <ul className="footer-links">
            <li>
              <Link href="/?category=Vedas">Vedas / वेद</Link>
            </li>
            <li>
              <Link href="/?category=Upanishads">Upanishads / उपनिषद</Link>
            </li>
            <li>
              <Link href="/?category=Epics">Epics / महाकाव्य</Link>
            </li>
            <li>
              <Link href="/?category=Puranas">Puranas / पुराण</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>📧 contact@sacredtexts.com</p>
          <p>🙏 Spread the wisdom</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Sacred Texts Library. All rights reserved.</p>
        <p>सर्वे भवन्तु सुखिनः - May all beings be happy</p>
      </div>
    </footer>
  );
}
