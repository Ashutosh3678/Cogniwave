import React from 'react';
import { ThreeDMarquee } from './ThreeDMarquee';

const reviews = [
  { name: "Dr. Sarah Johnson", role: "Clinical Psychologist, MindCare", body: "Cogni:wave has transformed how I connect with my patients. The platform is intuitive and my clients love the accessibility.", rating: 5, img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "Michael Chen", role: "Psychiatrist, WellBeing Center", body: "The real-time support features and secure messaging have made remote therapy incredibly effective and safe.", rating: 5, img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "Priya Patel", role: "Therapist, Mindful Health", body: "Integration with existing tools was seamless. The support team was incredibly helpful throughout the process.", rating: 4, img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "Robert Wilson", role: "Clinical Director, MindSpace", body: "The analytics dashboard provides insights we never had before. We've optimized our practice significantly.", rating: 5, img: "https://randomuser.me/api/portraits/men/75.jpg" },
  { name: "Emily Davis", role: "Counselor, CareFirst", body: "Appointment scheduling is now effortless. I used to spend hours coordinating, now it takes minutes.", rating: 5, img: "https://randomuser.me/api/portraits/women/22.jpg" },
  { name: "James Rodriguez", role: "Mental Health Specialist", body: "Platform reliability is outstanding. We scaled from individual practice to group therapy without any issues.", rating: 5, img: "https://randomuser.me/api/portraits/men/11.jpg" },
  { name: "Lisa Wong", role: "Child Psychologist, BrightMinds", body: "The gamification features keep young patients engaged. Parents love the family portal for tracking progress.", rating: 5, img: "https://randomuser.me/api/portraits/women/12.jpg" },
  { name: "David Kim", role: "Trauma Therapist, SafeSpace", body: "Secure video sessions with crisis intervention features give me peace of mind when working with clients.", rating: 4, img: "https://randomuser.me/api/portraits/men/45.jpg" }
]

const Star = ({ filled }) => (
  <span className={filled ? 'star filled' : 'star'} aria-hidden>{filled ? '★' : '☆'}</span>
)

const ReviewCard = ({ img, name, role, body, rating }) => {
  return (
    <div className="review-card" style={{ width: '350px', maxWidth: '100%' }}>
      <div className="review-content">
        <div className="review-author">
          <img className="review-avatar" src={img} alt={name} />
          <div>
            <h4 className="review-name">{name}</h4>
            <p className="review-role">{role}</p>
          </div>
        </div>
        <div className="review-stars">
          {[0,1,2,3,4].map(i => <Star key={i} filled={i < rating} />)}
        </div>
        <blockquote className="review-text">"{body}"</blockquote>
      </div>
      <div className="review-footer">
        <div className="verified-badge">
          <svg className="verified-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Verified User</span>
        </div>
        <div className="review-time">Recently</div>
      </div>
    </div>
  )
}

const Testimonials = () => {
  return (
    <section className="reviews-section" id="testimonials">
      <div className="reviews-container">
        <div className="reviews-header">
          <h2 className="reviews-title">
            Trusted by <span className="reviews-highlight">Mental Health Professionals</span>
          </h2>
          <p className="reviews-subtitle">Join thousands of professionals that have transformed their practice with Cogni:wave</p>
        </div>
        <div className="relative">
          <ThreeDMarquee
            className="h-[550px]"
            items={reviews.map((review, i) => (
              <ReviewCard key={i} {...review} />
            ))}
          />
        </div>
      </div>
    </section>
  )
}

export default Testimonials
