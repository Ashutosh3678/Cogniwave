const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo">
          <span className="logo-text">cogni:wave</span>
        </div>
        {/* Navigation Links */}
        <nav className="nav" aria-label="Main Navigation">
          <a className="nav-link" href="#services">Services</a>
          <a className="nav-link" href="#treatment">Treatment</a>
          <a className="nav-link" href="#blog">Blog</a>
          <a className="nav-link" href="#about">About us</a>
        </nav>
        {/* Right Actions: Moon Icon & Contact Button */}
        <div className="header-actions">
          {/* Moon Icon */}
          <button className="dark-mode-btn" aria-label="Toggle Dark Mode">
            <svg className="icon" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
          {/* Contact Button */}
          <a className="contact-btn" href="#contact">Contact us</a>
        </div>
      </div>
    </header>
  );
};

export default Header;
