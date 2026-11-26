
import { ArrowRight } from "lucide-react";

function StorySection() {
  return (
    <section className="story-section" id="story">
      <div className="story-image">
        <img
          src="https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=1000"
          alt="Pizza préparée avec passion"
          loading="lazy"
        />
      </div>

      <div className="story-content">
        <div className="section-label">
          <span></span>
          NOTRE PHILOSOPHIE
        </div>

        <h2>
          Plus qu'une pizza.
          <br />
          <span>Une passion.</span>
        </h2>

        <p>
          Chez Pizza Pete's, nous croyons que
          les meilleurs moments commencent
          autour d'une bonne pizza. Chaque
          recette est préparée avec attention,
          authenticité et amour du goût.
        </p>

        <a href="#contact" className="primary-button">
          Découvrir notre univers
          <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}

export default StorySection;
