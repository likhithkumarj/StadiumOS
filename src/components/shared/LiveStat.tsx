"use client";

import React, { useState, useEffect, useRef } from "react";

interface LiveStatProps {
  value: string | number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export default function LiveStat({ value, className = "", prefix = "", suffix = "" }: LiveStatProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      setAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setAnimating(false);
      }, 180); // Duration matches animation in globals.css

      prevValueRef.current = value;
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <span
      className={`tabular-nums font-display inline-block ${
        animating ? "animate-tick" : ""
      } ${className}`}
      aria-live="polite"
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
