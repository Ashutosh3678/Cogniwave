import CountUp from './CountUp';

const statsData = [
  {
    number: 10000,
    suffix: "+",
    label: "Active Users",
    description: "People trusting us with their mental wellness journey"
  },
  {
    number: 500,
    suffix: "+",
    label: "Certified Therapists",
    description: "Licensed professionals ready to help"
  },
  {
    number: 95,
    suffix: "%",
    label: "Success Rate",
    description: "Clients report improved mental health outcomes"
  },
  {
    number: 24,
    suffix: "/7",
    label: "Support Available",
    description: "Round-the-clock access to emergency support"
  }
];

const StatsSection = () => {
  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">
                <CountUp
                  from={0}
                  to={stat.number}
                  separator=","
                  direction="up"
                  duration={2}
                  className="count-up-text"
                />
                <span>{stat.suffix}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
