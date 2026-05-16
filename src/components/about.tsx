interface AboutProps {
  paragraphs: string[];
  skills?: string[];
  tech?: string[];
  softSkills?: string[];
}

export function About({ paragraphs, skills = [], tech = [], softSkills = [] }: AboutProps) {
  return (
    <div className="about-grid bento-grid-3">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={`about-copy bento-item reveal reveal-delay-${Math.min(index + 1, 3)}`}>
          {paragraph}
        </p>
      ))}
      <div className="about-list-section about-list-section-single bento-item reveal reveal-delay-2">
        <div className="about-note">
          <p className="section-label">Skills</p>
          <ul className="about-list">
            {skills.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      </div>
      
      <div className="about-list-section about-list-section-single bento-item reveal reveal-delay-3">
        <div className="about-note">
          <p className="section-label">Tech</p>
          <ul className="about-list">
            {tech.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      </div>
      
      <div className="about-list-section about-list-section-single bento-item reveal reveal-delay-4">
        <div className="about-note">
          <p className="section-label">Soft Skills</p>
          <ul className="about-list">
            {softSkills.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
