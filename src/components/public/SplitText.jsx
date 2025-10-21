
import React, { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';

const SplitText = ({ text, delay = 100, duration = 0.6 }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const chars = containerRef.current.children;
    gsap.fromTo(
      chars,
      { y: '100%', opacity: 0 },
      {
        y: '0%',
        opacity: 1,
        stagger: delay / 1000,
        duration: duration,
        ease: 'power3.out',
      }
    );
  }, [text, delay, duration]);

  return (
    <span ref={containerRef} className="inline-block" aria-label={text}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default SplitText;
