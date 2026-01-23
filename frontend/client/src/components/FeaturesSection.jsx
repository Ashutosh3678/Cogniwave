import { useEffect, useRef, useState } from 'react';

const FeaturesSection = () => {
  const activities = [
    {
      id: "01",
      title: "Personalized Therapy Sessions",
      description: "At Cogni:wave, we believe that therapy is more than just talking—it's a pathway to self-discovery, healing, and growth. We regularly connect you with certified therapists who tailor sessions to your unique needs, ensuring meaningful progress."
    },
    {
      id: "02",
      title: "AI-Powered Mental Health Insights",
      description: "Leverage cutting-edge artificial intelligence to track your mental wellness journey. Our AI analyzes patterns in your mood, behavior, and progress to provide actionable insights and personalized recommendations for improvement."
    },
    {
      id: "03",
      title: "Community Support Network",
      description: "Join a compassionate community of individuals on similar journeys. Share experiences, find support, and build meaningful connections in a safe, moderated environment designed to foster understanding and growth."
    },
    {
      id: "04",
      title: "24/7 Crisis Support",
      description: "Access immediate support whenever you need it most. Our round-the-clock crisis helpline connects you with trained professionals who provide compassionate, confidential assistance during difficult moments—because mental health doesn't wait for business hours."
    }
  ];

  const [visibleNumbers, setVisibleNumbers] = useState([]);
  const numberRefs = useRef([]);
  const previousY = useRef({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.dataset.index);
          const currentY = entry.boundingClientRect.y;
          const prevY = previousY.current[index];

          if (entry.isIntersecting) {
            // Scrolling down (element coming from bottom)
            if (prevY === undefined || currentY < prevY) {
              setVisibleNumbers((prev) => [...new Set([...prev, index])]);
            }
          } else {
            // Element left viewport - check if scrolling up
            if (prevY !== undefined && currentY > prevY) {
              setVisibleNumbers((prev) => prev.filter((i) => i !== index));
            }
          }

          previousY.current[index] = currentY;
        });
      },
      { threshold: 0.5 }
    );

    numberRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="features-section">
      {/* Header Section */}
      <div className="features-header">
        <h2 className="features-main-title">
          What do <span className="features-highlight">we DO?</span>
        </h2>
      </div>

      {/* Main Content Grid */}
      <div className="features-grid-container">
        {activities.map((item, index) => (
          <div 
            key={item.id} 
            className={`features-grid-item ${index % 2 !== 0 ? 'features-grid-item-reverse' : ''}`}
          >
            {/* Number Display Column */}
            <div className={`features-number-column ${index % 2 !== 0 ? 'features-number-end' : 'features-number-start'}`}>
              {/* Large Outlined Number */}
              <span 
                ref={(el) => (numberRefs.current[index] = el)}
                data-index={index}
                className={`features-large-number ${visibleNumbers.includes(index) ? 'features-number-solid' : ''}`}
                style={{ 
                  WebkitTextStroke: '3px #7A5AF8',
                  fontFamily: 'Arial, sans-serif'
                }}
              >
                {item.id}.
              </span>
            </div>

            {/* Text Content Column */}
            <div className="features-text-column">
              <h3 className="features-title">
                {item.title}
              </h3>
              <p className="features-description">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesSection;
