import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './LogoIntro.css';

let introPlayed = false;

function LogoIntro() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [docked, setDocked] = useState(false);
  const rootRef = useRef(null);
  const lockupRef = useRef(null);
  const flownRef = useRef(false);
  const dockedRef = useRef(false);

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('logo-intro-playing');
      document.body.classList.remove('logo-intro-docked');
    };
  }, []);

  useEffect(() => {
    if (pathname !== '/') return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || introPlayed) return undefined;

    introPlayed = true;
    setVisible(true);
    document.body.style.overflow = 'hidden';
    document.body.classList.add('logo-intro-playing');
    return undefined;
  }, [pathname]);

  useEffect(() => {
    if (!docked) return undefined;

    const target = document.querySelector('.site-header__logo');
    if (!target) return undefined;

    const update = () => {
      alignToHeader(false);
    };

    const observer = new ResizeObserver(update);
    observer.observe(target);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [docked]);

  const alignToHeader = (animate) => {
    const lockup = lockupRef.current;
    const root = rootRef.current;
    const target = document.querySelector('.site-header__logo');
    if (!lockup || !root || !target) return false;

    const previousTransition = lockup.style.transition;
    const previousTransform = lockup.style.transform;
    lockup.style.transition = 'none';
    lockup.style.transform = 'none';
    const from = lockup.getBoundingClientRect();
    lockup.style.transform = previousTransform;
    lockup.style.transition = previousTransition;

    const to = target.getBoundingClientRect();
    const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
    const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
    const scale = to.height / from.height;

    if (animate) root.classList.add('is-flying');
    lockup.style.transition = animate
      ? 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)'
      : 'none';
    lockup.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    return true;
  };

  const flyToHeader = () => {
    if (flownRef.current) return;
    flownRef.current = true;
    if (!alignToHeader(true)) {
      document.body.style.overflow = '';
      document.body.classList.remove('logo-intro-playing');
      setVisible(false);
    }
  };

  const onAnimationEnd = (event) => {
    if (event.animationName !== 'logo-intro-spin') return;
    flyToHeader();
  };

  const onTransitionEnd = (event) => {
    if (dockedRef.current) return;
    if (event.target !== lockupRef.current || event.propertyName !== 'transform') return;

    dockedRef.current = true;
    document.body.style.overflow = '';
    document.body.classList.remove('logo-intro-playing');
    document.body.classList.add('logo-intro-docked');
    rootRef.current?.classList.add('is-docked');
    setDocked(true);
    alignToHeader(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className="logo-intro"
      dir="ltr"
      role="presentation"
      onAnimationEnd={onAnimationEnd}
      onTransitionEnd={onTransitionEnd}
    >
      <div ref={lockupRef} className="logo-intro__lockup">
        <div className="logo-intro__mark">
          <div className="logo-intro__piece logo-intro__piece--circle">
            <img src="/intro/circle.png" alt="" />
          </div>
          <div className="logo-intro__piece logo-intro__piece--lower">
            <img src="/intro/lower-triangle.png" alt="" />
          </div>
          <div className="logo-intro__piece logo-intro__piece--upper">
            <img src="/intro/upper-triangle.png" alt="" />
          </div>
        </div>
        <img className="logo-intro__ar" src="/intro/ar-name.png" alt="العمرانية" />
        <img className="logo-intro__en" src="/intro/en-name.png" alt="OMRANIA" />
        <img className="logo-intro__desc" src="/intro/desc.png" alt="For Mech. & Engineering Supplies Ltd." />
      </div>
    </div>
  );
}

export default LogoIntro;
