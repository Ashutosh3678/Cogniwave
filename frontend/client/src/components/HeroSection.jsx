const HeroSection = () => {
  return (
    <main className="main">
      {/* Background Video on Left Side */}
      <div className="video-background">
        <video autoPlay loop muted playsInline>
          <source src="/landing_video.mp4" type="video/mp4"/>
        </video>
      </div>
      <div className="main-container">
        <div className="hero-grid">
          {/* Left Column: Headline */}
          <section className="hero-text">
            <h1 className="hero-title">
              Embark on your mental journey with professionals
            </h1>
          </section>
          {/* Right Column: Floating Card */}
          <section className="hero-card-container">
            {/* Floating Badge */}
            <div className="badge-container">
              <span className="badge">
                <span className="pulse-wrapper">
                  <span className="pulse-ring"></span>
                  <span className="pulse-dot"></span>
                </span>
                Ready to help
              </span>
            </div>
            {/* The Main White Card */}
            <div className="card">
              {/* Avatars Row */}
              <img 
                alt="Professionals" 
                className="card-image" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB83R6H96juhtLWr6Jzsn9aUqQbEiPhAcglOY8tI3bKSLQAY0RoWVr2ccfquEpCKSaKQEh1s5_gR6j84AKM6KFRTvyzBCi7JMakCAfVWo25xYRbPOWCUHZRSq8Sp-MImgTYaiWP5y2vwXgbxk5-JWeQLRHPlroG2vYky7ChB-TUfVUW71x128_yhegJyL24_nRYemdEE8CkctBBNQhLZo8xzThZAzmae6eC-43JEaR7D9inLVMJMSbT7C0eFl3tnoWvp5joVqETz9I"
              />
              {/* Card Text */}
              <div className="card-text">
                <p>
                  Welcome to Cogni:wave, your gateway to improved mental health. We're here to help you sculpt a stronger, more resilient mind.
                </p>
              </div>
              {/* CTA Button */}
              <a href="/dashboard/dash.html" className="cta-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Start Cure
                <svg className="arrow-icon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </a>
              {/* Secondary Link: Watch Review */}
              <div className="watch-review-container">
                <button className="watch-review-btn">
                  <div className="play-icon-wrapper">
                    <svg className="play-icon" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path clipRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" fillRule="evenodd"></path>
                    </svg>
                  </div>
                  <span className="watch-text">Watch review</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
