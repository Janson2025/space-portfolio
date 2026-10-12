import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../../assets/images/background.png';
import shipImage from '../../assets/images/spaceship.png';

const HeroScene = lazy(() => import('../features/hero-scene/HeroScene').then((module) => ({ default: module.HeroScene })));

function ShipImageFallback() {
  return (
    <img
      className="ship-banner"
      src={shipImage}
      alt="A copper and violet spacecraft flying through a glowing nebula"
      fetchPriority="high"
    />
  );
}

export function ShipStage() {
  return (
    <figure className="ship-stage">
      <Suspense fallback={<ShipImageFallback />}>
        <HeroScene fallback={<ShipImageFallback />} />
      </Suspense>
      <img className="ship-background" src={backgroundImage} alt="" aria-hidden="true" fetchPriority="high" />
      <Link className="ship-explore-button" to="/explore">ENTER EXPLORATION <span>↗</span></Link>
    </figure>
  );
}
