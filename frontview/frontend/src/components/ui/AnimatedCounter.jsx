import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ from = 0, to, duration = 1.5, format = (v) => v, className = '' }) => {
  const spring = useSpring(from, {
    stiffness: 50,
    damping: 15,
    duration: duration * 1000
  });
  
  const displayValue = useTransform(spring, (current) => {
    return format(Math.floor(current));
  });

  useEffect(() => {
    spring.set(to);
  }, [spring, to]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};

export default AnimatedCounter;
