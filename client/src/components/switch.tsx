'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSun,
  faMoon,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import styles from '@/components/switch.module.css';

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export default function Switch() {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  function handleThemeChange(
    e: React.MouseEvent<HTMLButtonElement>
  ): void {
    const { value } = e.currentTarget;

    setTheme(value === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  }

  useEffect(() => {
    setIsMounted(true);
  }, [theme]);

  return (
    isMounted && (
      <>
        <ThemeButton
          styles={`${styles.remove} ${styles.pos} ${
            theme === Theme.LIGHT ? styles.visible : styles.hidden
          }`}
          value={Theme.LIGHT}
          icon={<FontAwesomeIcon icon={faSun} />}
          onClick={(e) => handleThemeChange(e)}
        />
        <ThemeButton
          styles={`${styles.remove} ${styles.pos} ${
            theme === Theme.DARK ? styles.visible : styles.hidden
          }`}
          value={Theme.DARK}
          icon={<FontAwesomeIcon icon={faMoon} />}
          onClick={(e) => handleThemeChange(e)}
        />
      </>
    )
  );
}

function ThemeButton({
  styles,
  value,
  icon,
  onClick,
}: {
  styles: string;
  value: Theme;
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <button
      className={styles}
      onClick={(e) => onClick(e)}
      value={value}
    >
      {icon}
    </button>
  );
}
