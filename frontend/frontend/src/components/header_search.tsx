function Header() {
  return (
    <header className='search-header'>
      <input
        type="text"
        className="search-input"
        placeholder="Search a stock or ETF"
      />
      <div className='acount-section'>
        <div className='acount-services'>FD</div>
      </div>
    </header>
  );
};

export default Header;