import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/hero";
import CTAsection from "../components/CTAsection";
import LandingFooter from "../components/LandingFooter";
import Maintenance from "../components/MaintenanceSection";
import AboutSection from "../components/AboutSection";

export default function Landing() {
    return (
        <>
            <Hero />
            <AboutSection/>
            <Maintenance/>
            <CTAsection/>
            <LandingFooter />
        </>
    );
}
