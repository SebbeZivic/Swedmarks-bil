import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token } = useAuth();

  return (
    <nav>
      <Link to="/" className="nav-logo">Swedmarks Bil</Link>
      <ul>
        <li><Link to="/">Katalog</Link></li>
        {token ? (
          <>
            <li><Link to="/admin">Admin</Link></li>
            <li><Link to="/logout">Logga ut</Link></li>
          </>
        ) : (
          <li><Link to="/login">Logga in</Link></li>
        )}
      </ul>
    </nav>
  );
}
