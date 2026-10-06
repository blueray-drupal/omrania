import { Route, Routes } from 'react-router-dom';
import Header from './layout/header/Header';
import Footer from './layout/footer/Footer';
import Hero from './pages/home/Hero';
import LogoIntro from './pages/home/LogoIntro';
import WhyOmrania from './pages/home/WhyOmrania';
import AboutHome from './pages/home/AboutHome';
import HomeProducts from './pages/home/HomeProducts';
import Brands from './pages/home/Brands';
import Projects from './pages/home/Projects';
import Accreditations from './pages/home/Accreditations';
import Contact from './pages/home/Contact';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetails from './pages/projects/ProjectDetails';
import AccreditationsPage from './pages/accreditations/AccreditationsPage';
import AboutPage from './pages/about/AboutPage';
import BrandsPage from './pages/brands/BrandsPage';
import ContactPage from './pages/contact/ContactPage';
import QuotePage from './pages/quote/QuotePage';
import ProductsPage from './pages/products/ProductsPage';
import ProductCategoryPage from './pages/products/ProductCategoryPage';
import ProductDetailsPage from './pages/products/ProductDetailsPage';
import { SitePreferencesProvider } from './context/SitePreferencesContext';
import './main.css';

function HomePage() {
  return (
    <>
      <Hero />
      <WhyOmrania />
      <AboutHome />
      <HomeProducts />
      <Brands />
      <Projects />
      <Accreditations />
      <Contact />
    </>
  );
}

function App() {
  return (
    <SitePreferencesProvider>
      <div className="app-wrapper">
        <Header />
        <LogoIntro />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/accreditations" element={<AccreditationsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/brands" element={<BrandsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:categoryId" element={<ProductCategoryPage />} />
          <Route path="/products/:categoryId/:productId" element={<ProductDetailsPage />} />
        </Routes>
        <Footer />
      </div>
    </SitePreferencesProvider>
  );
}

export default App;
