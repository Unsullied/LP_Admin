'use client'

import React from 'react'

import styles from './button.module.css'

export function Button({
  variant = 'default',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary'
}) {
  return (
    <button
      {...props}
      className={[styles.btn, variant === 'primary' ? styles.primary : '', className || ''].join(
        ' ',
      )}
    />
  )
}
