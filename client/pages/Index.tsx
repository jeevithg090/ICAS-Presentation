import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import Testimonials from "@/components/sections/Testimonials";
import Newsletter from "@/components/sections/Newsletter";
import DelegateSessionsSummary from "@/components/sections/DelegateSessionsSummary";
import { ArrowRight, Globe, GraduationCap, Users, Award, DollarSign, BookOpen, MapPin, Mic, FileText } from "lucide-react";

const stats = [
  { label: "Years of Excellence", value: "30+" },
  { label: "Students Transferred", value: "1,500+" },
  { label: "Partner Universities", value: "100+" },
  { label: "Countries Available", value: "10+" },
];

const engineeringPrograms = [
  {
    title: "Computer Science & Engineering",
    description: "AI/ML, Cybersecurity, Big Data Analytics",
    icon: "💻",
    duration: "2+2 Years",
    image: "https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "Aeronautical Engineering",
    description: "Aircraft Design, Aviation Systems, Flight Mechanics",
    icon: "✈️",
    duration: "1+3 Years",
    image: "https://images.pexels.com/photos/256219/pexels-photo-256219.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "Mechanical Engineering",
    description: "Design, Manufacturing, Robotics, Automotive",
    icon: "⚙️",
    duration: "2+2 Years",
    image: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "Electrical & Electronics",
    description: "Power Systems, Control, Telecommunications",
    icon: "⚡",
    duration: "2+2 Years",
    image: "https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "Chemical Engineering",
    description: "Process Engineering, Materials Science, Biotechnology",
    icon: "🧪",
    duration: "2+2 Years",
    image: "https://images.pexels.com/photos/2280568/pexels-photo-2280568.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    title: "Civil Engineering",
    description: "Infrastructure, Construction, Environmental",
    icon: "🏗️",
    duration: "2+2 Years",
    image: "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

const keyBenefits = [
  {
    icon: DollarSign,
    title: "Save Up to 40%",
    description: "Significant cost savings by completing first 2 years in India"
  },
  {
    icon: Globe,
    title: "Global Recognition",
    description: "International degree from prestigious universities worldwide"
  },
  {
    icon: GraduationCap,
    title: "Seamless Transfer",
    description: "Guided pathway with guaranteed credit transfer to 100+ universities"
  },
  {
    icon: Award,
    title: "High Earning Potential",
    description: "Average starting salary of $50,000-$85,000 upon graduation"
  }
];

const topUniversities = [
  { name: "University of California, Berkeley", country: "USA", logo: "🏛️", ranking: "Top 5" },
  { name: "University of Illinois, Urbana-Champaign", country: "USA", logo: "🎓", ranking: "Top 10" },
  { name: "University of Toronto", country: "Canada", logo: "🍁", ranking: "Top 20" },
  { name: "University of Queensland", country: "Australia", logo: "🦘", ranking: "Top 50" },
  { name: "University of Edinburgh", country: "UK", logo: "🏰", ranking: "Top 30" },
  { name: "Technical University of Munich", country: "Germany", logo: "⚙️", ranking: "Top 40" }
];

const admissionRequirements = [
  { requirement: "12th Standard", description: "60% aggregate in English, Physics, Mathematics + 1 Science subject", icon: "📚" },
  { requirement: "English Proficiency", description: "TOEFL 90+ or IELTS equivalent for non-English medium students", icon: "🌍" },
  { requirement: "No Entrance Exam", description: "Merit-based admission on first-come, first-served basis", icon: "✅" },
  { requirement: "Application Fee", description: "₹2,000 non-refundable application processing fee", icon: "💳" }
];

const campusFacilities = [
  { facility: "State-of-the-Art Labs", description: "Advanced engineering laboratories with latest equipment", icon: "🔬", color: "blue" },
  { facility: "World-Class Library", description: "Extensive digital and print resources with global access", icon: "📖", color: "green" },
  { facility: "Sports Complex", description: "Marena sports facility with gym, courts, and swimming pool", icon: "🏊", color: "purple" },
  { facility: "Innovation Center", description: "Dedicated space for research, prototyping, and entrepreneurship", icon: "💡", color: "orange" },
  { facility: "Student Housing", description: "Comfortable hostels with modern amenities and security", icon: "🏠", color: "indigo" },
  { facility: "Global Community", description: "Students from 55+ countries creating diverse environment", icon: "🌐", color: "pink" }
];

const successMetrics = [
  { metric: "30+ Years", description: "Of excellence in international education", icon: "🏆" },
  { metric: "1,500+ Alumni", description: "Successfully transferred to global universities", icon: "👥" },
  { metric: "100+ Partners", description: "Universities across 10+ countries", icon: "🤝" },
  { metric: "$50K-$85K", description: "Average starting salary for graduates", icon: "💰" },
  { metric: "40% Savings", description: "On international education costs", icon: "💸" },
  { metric: "95% Success", description: "Rate of successful university transfers", icon: "📈" }
];

const testimonials = [
  {
    name: "Priya Sharma",
    program: "Computer Science",
    university: "UC Berkeley",
    quote: "ICAS gave me the perfect foundation to excel at Berkeley. The curriculum was perfectly aligned and the transfer process was seamless.",
    image: "👩‍💻"
  },
  {
    name: "Arjun Patel",
    program: "Mechanical Engineering", 
    university: "University of Toronto",
    quote: "The cost savings were incredible, and the quality of education at ICAS prepared me well for the rigorous program at UofT.",
    image: "👨‍🔧"
  },
  {
    name: "Sneha Reddy",
    program: "Aeronautical Engineering",
    university: "University of Illinois",
    quote: "ICAS's 1+3 program for Aeronautical Engineering was perfect. I saved money and got into my dream university.",
    image: "👩‍✈️"
  }
];

// Animated Card Component
const AnimatedCard = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
};

// Gradient Background Component
const GradientBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -inset-10 opacity-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

// Floating Elements Component
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function Index() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Trigger hero animations after component mounts
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  return (
    <main className="min-h-screen">
      <SEO
        title="ICAS — International Centre for Applied Sciences | Your Gateway to Global Engineering Education"
        description="Join ICAS Manipal's International Transfer Program. Complete 2 years in India, transfer to 100+ universities worldwide. Save up to 40% on international education costs while earning a globally recognized engineering degree."
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <GradientBackground />
        <FloatingElements />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-15"></div>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 animate-gradient-shift"></div>
        <div className="relative">
          <div className="container py-20 md:py-32">
            <div className="max-w-4xl text-white">
              <div 
                className={`inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/25 backdrop-blur-sm transition-all duration-700 ${
                  heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"
                }`}
                style={{ transitionDelay: "0.2s" }}
              >
                <Globe className="h-4 w-4" />
                International Centre for Applied Sciences
              </div>
              <h1 
                className={`mt-6 text-5xl font-extrabold tracking-tight md:text-7xl transition-all duration-800 ${
                  heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: "0.4s" }}
              >
                Your Gateway to
                <span 
                  className={`block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-800 ${
                    heroVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: "0.6s" }}
                >
                  Global Engineering Excellence
              </span>
              </h1>
              <p 
                className={`mt-6 max-w-3xl text-xl leading-relaxed text-blue-100 md:text-2xl transition-all duration-800 ${
                  heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "0.8s" }}
              >
                Join ICAS Manipal's revolutionary <strong className="text-cyan-300">International Transfer Program</strong> — 
                complete 2 years in India, transfer to 100+ prestigious universities worldwide. 
                <span className="text-yellow-300 font-semibold">Save up to 40%</span> on education costs while earning a globally recognized engineering degree from top-ranked institutions.
              </p>
              <div 
                className={`mt-10 flex flex-wrap gap-4 transition-all duration-800 ${
                  heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "1.0s" }}
              >
                <Link
                  to="/academics"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:-translate-y-2 hover:shadow-cyan-500/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  🚀 Explore Programs
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/transfer"
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-cyan-400/50 px-8 py-4 text-lg font-bold text-cyan-300 backdrop-blur-sm transition-all hover:bg-cyan-400/10 hover:border-cyan-400 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <MapPin className="h-5 w-5" />
                  🌍 University Partners
                </Link>
                <Link
                  to="/ask-icas"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:-translate-y-2 hover:shadow-purple-500/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  💬 Ask ICAS
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative wave */}
          <svg
            aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 w-full text-background"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,64L48,58.7C96,53,192,43,288,53.3C384,64,480,96,576,122.7C672,149,768,171,864,154.7C960,139,1056,85,1152,74.7C1248,64,1344,96,1392,112L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            />
          </svg>
      </section>

      {/* Key Benefits Section */}
      <section className="container -mt-10 py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <AnimatedCard className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Why Choose ICAS?
          </h2>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the perfect blend of quality education, cost savings, and global opportunities that sets ICAS apart from traditional engineering programs
          </p>
        </AnimatedCard>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {keyBenefits.map((benefit, index) => (
            <AnimatedCard key={index} delay={index * 0.1}>
              <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-200 transition-all hover:-translate-y-3 hover:shadow-2xl hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white transition-transform group-hover:rotate-360 duration-600 mb-4">
                      <benefit.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Admission Requirements Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <AnimatedCard className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Simple Admission Process
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              No entrance exams required! Our merit-based admission process is designed to be accessible and straightforward
            </p>
          </AnimatedCard>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {admissionRequirements.map((req, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 to-blue-50 p-8 shadow-xl ring-1 ring-green-200 transition-all hover:-translate-y-3 hover:shadow-2xl hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">
                        {req.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{req.requirement}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{req.description}</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
          <div className="text-center mt-12">
          <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 px-8 py-4 text-lg font-bold text-white shadow-2xl transition-all hover:-translate-y-2 hover:shadow-green-500/25 hover:scale-105"
            >
              📝 Apply Now
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Engineering Programs Section */}
      <section className="bg-gradient-to-br from-slate-50 to-gray-100 py-20">
        <div className="container">
          <AnimatedCard className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Engineering Programs
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from 6 specialized engineering disciplines. Complete your foundation in India, 
              then transfer to world-class universities abroad with guaranteed credit transfer.
            </p>
          </AnimatedCard>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {engineeringPrograms.map((program, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="group relative overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-gray-200 transition-all hover:-translate-y-3 hover:shadow-3xl hover:scale-105">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-3xl transition-transform group-hover:scale-125 group-hover:rotate-12 duration-300">
                        {program.icon}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                        <span className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-semibold">{program.duration}</span>
              </div>
            </div>
                    <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                    <Link
                      to="/academics"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group-hover:translate-x-1 duration-300"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4" />
          </Link>
                  </div>
                </div>
              </AnimatedCard>
        ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container">
          <AnimatedCard className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ICAS by the Numbers
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Three decades of excellence in international engineering education with proven results
            </p>
          </AnimatedCard>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {successMetrics.map((metric, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className="group text-center p-8 rounded-3xl bg-white shadow-xl ring-1 ring-blue-200 transition-all hover:scale-105 hover:shadow-2xl">
                  <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">
                    {metric.icon}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 animate-counter">
                    {metric.metric}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {metric.description}
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Facilities Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <AnimatedCard className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              World-Class Campus Facilities
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Experience state-of-the-art facilities at the beautiful Manipal campus, designed to provide the perfect environment for academic excellence
            </p>
          </AnimatedCard>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {campusFacilities.map((facility, index) => (
              <AnimatedCard key={index} delay={index * 0.1}>
                <div className={`group relative overflow-hidden rounded-3xl p-8 shadow-xl transition-all hover:-translate-y-3 hover:shadow-2xl hover:scale-105 ${
                  facility.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-100 ring-1 ring-blue-200' :
                  facility.color === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100 ring-1 ring-green-200' :
                  facility.color === 'purple' ? 'bg-gradient-to-br from-purple-50 to-purple-100 ring-1 ring-purple-200' :
                  facility.color === 'orange' ? 'bg-gradient-to-br from-orange-50 to-orange-100 ring-1 ring-orange-200' :
                  facility.color === 'indigo' ? 'bg-gradient-to-br from-indigo-50 to-indigo-100 ring-1 ring-indigo-200' :
                  'bg-gradient-to-br from-pink-50 to-pink-100 ring-1 ring-pink-200'
                }`}>
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="text-4xl mb-4 transition-transform group-hover:scale-110 duration-300">
                        {facility.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{facility.facility}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{facility.description}</p>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* International Transfer Program Overview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                The ICAS Advantage
              </h2>
              <p className="mt-6 text-lg text-gray-600">
                Our unique 2+2 International Transfer Program offers the perfect pathway 
                to global engineering education. Start your journey in India, complete it 
                at world-renowned universities abroad.
              </p>
              <div className="mt-8 space-y-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Strong Foundation</h3>
                    <p className="text-sm text-gray-600">
                      Build a solid academic base with internationally-aligned curriculum
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Global Exposure</h3>
                    <p className="text-sm text-gray-600">
                      Experience diverse cultures and teaching methodologies
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Users className="h-6 w-6" />
            </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Alumni Network</h3>
                    <p className="text-sm text-gray-600">
                      Join 1,500+ successful graduates working globally
                    </p>
            </div>
          </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200">
                <h3 className="text-xl font-semibold mb-6">Program Timeline</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Years 1-2: Foundation at Manipal</h4>
                      <p className="text-sm text-gray-600">Complete core engineering subjects with international standards</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-white text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Transfer Process</h4>
                      <p className="text-sm text-gray-600">Guided application to 100+ partner universities worldwide</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-semibold">
                      3
              </div>
                    <div>
                      <h4 className="font-medium">Years 3-4: International Completion</h4>
                      <p className="text-sm text-gray-600">Graduate with a globally recognized engineering degree</p>
              </div>
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top University Partners */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Partner Universities
          </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Transfer to prestigious universities across the globe. Our students have successfully 
              joined top-ranked institutions in the USA, UK, Canada, Australia, and Europe.
            </p>
        </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topUniversities.map((university, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg ring-1 ring-gray-200 transition-all hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{university.logo}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{university.name}</h3>
                    <p className="text-sm text-gray-600">{university.country}</p>
        </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/transfer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold transition-all hover:bg-blue-700 hover:-translate-y-1 hover:shadow-lg"
            >
              View All 100+ Partners
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Student Life Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Life at ICAS Manipal
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience world-class facilities, vibrant campus life, and a supportive community 
              that prepares you for global success.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="text-4xl mb-4">🏛️</div>
              <h3 className="text-xl font-semibold mb-2">World-Class Campus</h3>
              <p className="text-gray-600">
                State-of-the-art labs, libraries, and facilities at the beautiful Manipal campus
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Global Community</h3>
              <p className="text-gray-600">
                Study alongside students from 55+ countries in a truly international environment
              </p>
        </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Career Support</h3>
              <p className="text-gray-600">
                Dedicated transfer team guides you through university applications and visa processes
              </p>
                </div>
              </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Alumni Success Stories
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our graduates are making their mark in leading companies and institutions worldwide
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 ring-1 ring-blue-200">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-semibold mb-2">Global Careers</h3>
              <p className="text-gray-600">
                Alumni working at Google, Microsoft, Tesla, Boeing, and other Fortune 500 companies
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 ring-1 ring-green-200">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">High Earning Potential</h3>
              <p className="text-gray-600">
                Average starting salary of $50,000-$85,000 with excellent career progression
              </p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 ring-1 ring-purple-200">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Degrees</h3>
              <p className="text-gray-600">
                Many alumni pursue Master's and PhD programs at top universities globally
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fee Structure Preview */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Transparent Fee Structure
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Save significantly on international education while maintaining world-class quality
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-2">₹4,95,000</div>
              <div className="text-sm font-medium text-gray-700 mb-1">Year 1 (Manipal)</div>
              <div className="text-xs text-gray-500">+ ₹10,000 Caution Deposit</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="text-2xl font-bold text-blue-600 mb-2">₹4,95,000</div>
              <div className="text-sm font-medium text-gray-700 mb-1">Year 2 (Manipal)</div>
              <div className="text-xs text-gray-500">No additional deposits</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-2">$20,000-45,000</div>
              <div className="text-sm font-medium text-gray-700 mb-1">Year 3 (Abroad)</div>
              <div className="text-xs text-gray-500">Varies by university & country</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white shadow-lg ring-1 ring-gray-200">
              <div className="text-2xl font-bold text-green-600 mb-2">$20,000-45,000</div>
              <div className="text-sm font-medium text-gray-700 mb-1">Year 4 (Abroad)</div>
              <div className="text-xs text-gray-500">Complete your degree</div>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              to="/financial-aid"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white font-semibold transition-all hover:bg-green-700 hover:-translate-y-1 hover:shadow-lg"
            >
              Learn About Financial Aid
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Student Tools Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container">
          <AnimatedCard className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Tools & Resources
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Access powerful AI-powered tools designed to enhance your academic experience and streamline your learning process
            </p>
          </AnimatedCard>
          
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Delegate Sessions Summary Tool */}
            <AnimatedCard delay={0.1}>
              <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-blue-200 transition-all hover:-translate-y-3 hover:shadow-2xl hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white transition-transform group-hover:rotate-360 duration-600">
                      <Mic className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Meeting Transcription & Summary</h3>
                      <p className="text-sm text-blue-600 font-semibold">AI-Powered Audio Analysis</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Upload MP3 audio recordings of delegate sessions, meetings, or lectures. Get instant transcription 
                    and comprehensive summaries with key decisions, action items, and important highlights.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      Automatic transcription of audio content
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      AI-generated meeting summaries
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      Extract key decisions and action items
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      Timeline of important moments
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Study Resources Tool */}
            <AnimatedCard delay={0.2}>
              <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-green-200 transition-all hover:-translate-y-3 hover:shadow-2xl hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white transition-transform group-hover:rotate-360 duration-600">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Academic Resources</h3>
                      <p className="text-sm text-green-600 font-semibold">Study Materials & Support</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Access comprehensive study materials, course resources, and academic support tools 
                    to excel in your engineering program and prepare for international transfer.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      Course materials and lecture notes
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      Practice exams and assignments
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      Transfer preparation resources
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      Academic calendar and deadlines
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/portal"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-white font-semibold shadow-lg transition-all hover:-translate-y-1 hover:shadow-green-500/25 hover:scale-105"
                    >
                      Access Portal
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Delegate Summary Component */}
          <div className="mt-16">
            <AnimatedCard delay={0.3}>
              <DelegateSessionsSummary />
            </AnimatedCard>
          </div>
        </div>
      </section>

      {/* Student Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-100">
        <div className="container">
          <AnimatedCard className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our alumni who have successfully transferred to top universities and are now building successful careers globally
            </p>
          </AnimatedCard>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <AnimatedCard key={index} delay={index * 0.2}>
                <div className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl ring-1 ring-indigo-200 transition-all hover:-translate-y-3 hover:shadow-2xl hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-4 transition-transform group-hover:scale-110 duration-300">
                        {testimonial.image}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{testimonial.name}</h3>
                      <p className="text-sm text-indigo-600 font-semibold">{testimonial.program}</p>
                      <p className="text-sm text-gray-500">{testimonial.university}</p>
                    </div>
                    <blockquote className="text-gray-600 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                </div>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative overflow-hidden py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <GradientBackground />
        <FloatingElements />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 animate-gradient-shift"></div>
        <div className="relative container">
          <div className="text-center text-white">
            <AnimatedCard>
              <h2 className="text-4xl font-bold tracking-tight md:text-6xl mb-8">
                Ready to Start Your
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Global Engineering Journey?
                </span>
              </h2>
              <p className="text-xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
                Join <span className="text-yellow-300 font-bold">1,500+ successful students</span> who have transformed their careers through ICAS. 
                Apply now and secure your pathway to world-class engineering education at top-ranked universities worldwide.
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-10 py-5 text-xl font-bold text-white shadow-2xl transition-all hover:-translate-y-2 hover:shadow-cyan-500/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  🚀 Apply Now
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/ask-icas"
                  className="inline-flex items-center gap-3 rounded-2xl border-2 border-cyan-400/50 px-10 py-5 text-xl font-bold text-cyan-300 backdrop-blur-sm transition-all hover:bg-cyan-400/10 hover:border-cyan-400 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  💬 Ask ICAS
                </Link>
                <Link
                  to="/transfer"
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 px-10 py-5 text-xl font-bold text-white shadow-2xl transition-all hover:-translate-y-2 hover:shadow-purple-500/25 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  🌍 View Universities
                </Link>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </section>

      <Testimonials />
      <Newsletter />
    </main>
  );
}
