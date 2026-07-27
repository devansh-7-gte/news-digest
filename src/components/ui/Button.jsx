'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
  href,
  ...props
}) {
  const baseStyles = 'px-5 py-2.5 rounded-md font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 border select-none inline-flex items-center justify-center';
  
  const variants = {
    primary: 'bg-brand-lime hover:bg-brand-lime-hover text-brand-dark border-brand-lime shadow-[0_0_15px_rgba(195,255,46,0.12)] hover:shadow-[0_0_25px_rgba(195,255,46,0.35)]',
    secondary: 'bg-white/5 hover:bg-white/10 text-white border-brand-border hover:border-white/20',
    outline: 'bg-transparent text-white border-white/20 hover:border-brand-lime hover:text-brand-lime',
    ghost: 'bg-transparent text-brand-grey hover:text-white border-transparent'
  };

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      whileHover={disabled ? {} : { scale: 1.02, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.98, y: 0 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
