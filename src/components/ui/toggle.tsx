'use client'

import React from 'react'

import styles from './toggle.module.css'

export const Toggle = ({
  checked,
  onChange,
  disabled,
  label,
  className,
  id,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
  id?: string
}) => {
  const autoId = React.useId()
  const inputId = id ?? autoId

  return (
    <label
      className={[styles.root, disabled ? styles.disabled : '', className || ''].join(' ')}
      htmlFor={inputId}
    >
      {label ? <span className={styles.label}>{label}</span> : null}
      <span className={[styles.track, checked ? styles.on : styles.off].join(' ')}>
        <span className={styles.thumb} />
      </span>
      <input
        id={inputId}
        className={styles.input}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label || 'Toggle'}
      />
    </label>
  )
}
