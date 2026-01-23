const statsData = [
  {
    number: "10,000+",
    label: "Active Users",
    description: "People trusting us with their mental wellness journey"
  },
  {
    number: "500+",
    label: "Certified Therapists",
    description: "Licensed professionals ready to help"
  },
  {
    number: "95%",
    label: "Success Rate",
    description: "Clients report improved mental health outcomes"
  },
  {
    number: "24/7",
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
              <div className="stat-number">{stat.number}</div>
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
