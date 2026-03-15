import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import BentoGrid from '../components/BentoGrid';
import '../styles/homepage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <BentoGrid />
    </div>
  );
}
