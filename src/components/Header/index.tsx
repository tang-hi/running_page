import { Link } from 'react-router-dom';
import useSiteMetadata from '@/hooks/useSiteMetadata';
import styles from './style.module.css';

const Header = () => {
  const { navLinks } = useSiteMetadata();

  return (
    <>
      <nav className="mx-auto mt-8 flex w-full max-w-screen-2xl items-center justify-between px-6 font-mono lg:px-16">
        <div className="flex items-center flex-wrap gap-y-2">
          <Link to="/" className={styles.navLink}>
            HOME
          </Link>
          <span className={styles.pipeSeparator}>|</span>
          <Link to="/progress" className={styles.navLink}>
            PROGRESS
          </Link>
          {navLinks.map((n, i) => (
            <span key={i} className="flex items-center">
              <span className={styles.pipeSeparator}>|</span>
              <a href={n.url} className={styles.navLink}>
                {n.name.toUpperCase()}
              </a>
            </span>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Header;
