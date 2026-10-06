import { Link } from 'react-router-dom';
import './Footer.css';

const LOGO_SRC = 'https://omrania10.figma.site/assets/omrania2_logo-D25BDk5f.png';
const MAP_SRC = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d27074.52684876798!2d35.83446655!3d31.98064975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151ca17fa8b7da83%3A0x1d7ebff2fc636e2f!2sKhalda%2C%20Amman%2C%20Jordan!5e0!3m2!1sen!2sus!4v1716942000000!5m2!1sen!2sus';

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Brands & Partners', to: '/brands' },
  { label: 'Projects', to: '/projects' },
  { label: 'Accreditations', to: '/accreditations' },
  { label: 'Contact Us', to: '/contact' },
];

const PRODUCT_LINKS = [
  'Valves',
  'Pumps',
  'Pipes & Fittings',
  'HVAC',
  'Industrial Equipment',
];

function Footer() {
  return (
    <footer className="site-footer" dir="ltr">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <img className="site-footer__logo" src={LOGO_SRC} alt="Al Omrania" />
            <p className="site-footer__about">
              Al Omrania for Mechanical & Engineering Supplies. Premium engineering products and technical expertise for demanding industrial applications.
            </p>
            <div className="site-footer__social">
              <a href="#" aria-label="LinkedIn">IN</a>
              <a href="#" aria-label="Twitter">TW</a>
              <a href="#" aria-label="Facebook">FB</a>
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            {QUICK_LINKS.map((item) => (
              <Link key={item.label} to={item.to}>{item.label}</Link>
            ))}
          </div>

          <div>
            <h4>Products</h4>
            {PRODUCT_LINKS.map((label) => (
              <a key={label} href="#">{label}</a>
            ))}
          </div>

          <div>
            <h4>Contact</h4>
            <div className="site-footer__contact">
              <span aria-hidden="true">📞</span>
              <span>+962 6 5561362 / 66</span>
            </div>
            <div className="site-footer__contact">
              <span aria-hidden="true">✉️</span>
              <span>ibrahim@omraniajo.com</span>
            </div>
            <div className="site-footer__contact">
              <span aria-hidden="true">📍</span>
              <span>Khalda - Amer Bin Malek St, Amman</span>
            </div>
            <div className="site-footer__map">
              <iframe
                src={MAP_SRC}
                title="Location Map"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="site-footer__bar">
          <p>© 2024 Al Omrania for Mechanical & Engineering Supplies. All rights reserved.</p>
          <div>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
