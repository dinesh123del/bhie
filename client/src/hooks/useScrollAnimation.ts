import { useEffect, useRef } from 'react';
import { useAnimation, useInView } from 'framer-motion';

export const useScrollAnimation = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('animate');
    }
  }, [isInView, controls]);

  return { ref, controls };
};
