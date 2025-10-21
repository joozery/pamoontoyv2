import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const SplitText = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  tag = 'p',
  onLetterAnimationComplete
}) => {
  const ref = useRef(null);
  const animationCompletedRef = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(() => {
    if (!ref.current || !text || !fontsLoaded) return;
    const el = ref.current;

    // Manual text splitting without premium plugin
    const splitTextManually = (element, type) => {
      const textContent = element.textContent;
      element.innerHTML = '';
      
      if (type === 'chars') {
        return textContent.split('').map((char) => {
          const span = document.createElement('span');
          span.className = 'split-char inline-block';
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.display = 'inline-block';
          element.appendChild(span);
          return span;
        });
      } else if (type === 'words') {
        const words = textContent.split(' ');
        const spans = [];
        words.forEach((word, index) => {
          const span = document.createElement('span');
          span.className = 'split-word inline-block';
          span.textContent = word;
          span.style.display = 'inline-block';
          element.appendChild(span);
          spans.push(span);
          if (index < words.length - 1) {
            element.appendChild(document.createTextNode(' '));
          }
        });
        return spans;
      }
      return [element];
    };

    const startPct = (1 - threshold) * 100;
    const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
    const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
    const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
    const sign =
      marginValue === 0
        ? ''
        : marginValue < 0
          ? `-=${Math.abs(marginValue)}${marginUnit}`
          : `+=${marginValue}${marginUnit}`;
    const start = `top ${startPct}%${sign}`;

    // Split text manually
    const targets = splitTextManually(el, splitType);

    // Animate
    gsap.fromTo(targets, { ...from }, {
      ...to,
      duration,
      ease,
      stagger: delay / 1000,
      scrollTrigger: {
        trigger: el,
        start,
        once: true,
        fastScrollEnd: true,
        anticipatePin: 0.4
      },
      onComplete: () => {
        animationCompletedRef.current = true;
        onLetterAnimationComplete?.();
      },
      willChange: 'transform, opacity',
      force3D: true
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el) st.kill();
      });
    };
  }, {
    dependencies: [
      text,
      delay,
      duration,
      ease,
      splitType,
      JSON.stringify(from),
      JSON.stringify(to),
      threshold,
      rootMargin,
      fontsLoaded,
      onLetterAnimationComplete
    ],
    scope: ref
  });

  const renderTag = () => {
    const style = {
      wordWrap: 'break-word',
      willChange: 'transform, opacity'
    };
    const wrapperClass = textAlign === 'center' ? 'flex justify-center w-full' : '';
    const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;
    
    const content = (() => {
      switch (tag) {
        case 'h1':
          return (
            <h1 ref={ref} style={style} className={classes}>
              {text}
            </h1>
          );
        case 'h2':
          return (
            <h2 ref={ref} style={style} className={classes}>
              {text}
            </h2>
          );
        case 'h3':
          return (
            <h3 ref={ref} style={style} className={classes}>
              {text}
            </h3>
          );
        case 'h4':
          return (
            <h4 ref={ref} style={style} className={classes}>
              {text}
            </h4>
          );
        case 'h5':
          return (
            <h5 ref={ref} style={style} className={classes}>
              {text}
            </h5>
          );
        case 'h6':
          return (
            <h6 ref={ref} style={style} className={classes}>
              {text}
            </h6>
          );
        default:
          return (
            <p ref={ref} style={style} className={classes}>
              {text}
            </p>
          );
      }
    })();

    return wrapperClass ? <div className={wrapperClass}>{content}</div> : content;
  };
  return renderTag();
};

export default SplitText;
