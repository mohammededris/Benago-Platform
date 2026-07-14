import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Benago</span>
          <p className="footer-tagline">Empowering learners, one course at a time.</p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <span className="footer-col-title">Social Media</span>
            <a href="https://www.facebook.com/profile.php?id=61591330822740" target="_blank">Facebook</a>
            <a href="https://www.instagram.com/benago_10/" target="_blank">Instagram</a>
            <a href="https://www.linkedin.com/in/benago-courses-57b17b419/" target="_blank">Linkedin</a>
          </div>
          <div className="footer-col">
            <span className="footer-col-title">Support</span>
            <a href="mailto:benago2627@gmail.com">Send Email</a>
            <a
            aria-label="Chat on WhatsApp"
            href="https://wa.me/201288830792?text=Hi"
          >
            {" "}
            <img alt="Chat on WhatsApp" src="./WhatsAppButtonGreenLarge.svg" />
          </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {year} Benago. All rights reserved.</span>
      </div>
    </footer>
  );
}
