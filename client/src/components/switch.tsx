'use client';

import { useTheme } from 'next-themes';
import styles from '@/components/switch.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export default function Switch() {
  const { theme, setTheme } = useTheme();

  function onChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const { checked } = e.target;
    setTheme(checked ? Theme.DARK : Theme.LIGHT);
  }

  return (
    <div className={styles.switch}>
      <label htmlFor="checkbox">
        <input
          type="checkbox"
          onChange={onChange}
          checked={theme == Theme.DARK ? true : false}
        />
        {theme == Theme.DARK ? (
          <FontAwesomeIcon icon={faMoon} />
        ) : (
          <FontAwesomeIcon icon={faSun} />
        )}
      </label>
    </div>
  );
}
