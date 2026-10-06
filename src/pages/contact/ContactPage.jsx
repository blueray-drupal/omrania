import { useEffect } from 'react';
import Contact from '../home/Contact';

function ContactPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return <Contact page />;
}

export default ContactPage;
