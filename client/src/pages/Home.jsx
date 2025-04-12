import React, { useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  Flex,
  Image
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaGlobe, FaLock, FaCode, FaRocket } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

const Feature = ({ icon, title, text, delay }) => {
  return (
    <Box
      className="feature-card"
      data-delay={delay}
      opacity={0}
      transform="translateY(30px)"
    >
      <Box className="feature-icon">
        <Icon as={icon} w={10} h={10} color="#8b5cf6" />
      </Box>
      <Heading size="md" color="#f8fafc" mb={4} className="feature-title">
        {title}
      </Heading>
      <Text color="#cbd5e1" className="feature-desc">
        {text}
      </Text>
    </Box>
  );
};

const Home = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Hero animations
    gsap.to('.hero h1', {
      opacity: 1, 
      y: 0, 
      duration: 1,
      ease: 'power3.out'
    });
    
    gsap.to('.hero p', {
      opacity: 1, 
      y: 0, 
      duration: 1,
      delay: 0.3,
      ease: 'power3.out'
    });
    
    gsap.to('.action-btn', {
      opacity: 1, 
      y: 0, 
      duration: 1,
      delay: 0.6,
      ease: 'power3.out'
    });

    // Create data particles animation
    const createDataParticle = () => {
      const dataParticles = document.getElementById('data-particles');
      if (!dataParticles) return;
      
      const particle = document.createElement('span');
      particle.classList.add('data-bit');
      
      const size = Math.random() * 10 + 5;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 10 + 5;
      const delay = Math.random() * 5;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      
      dataParticles.appendChild(particle);
      
      gsap.to(particle, {
        x: (Math.random() - 0.5) * 200,
        y: (Math.random() - 0.5) * 200,
        opacity: 0,
        duration: duration,
        delay: delay,
        onComplete: function() {
          particle.remove();
        }
      });
    };
    
    // Create initial particles
    for (let i = 0; i < 20; i++) {
      createDataParticle();
    }
    
    // Create new particles periodically
    const particleInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        createDataParticle();
      }
    }, 500);

    // Create binary background
    const createBinaryText = () => {
      const binaryBg = document.getElementById('binary-bg');
      if (!binaryBg) return;
      
      const binaryChars = ['0', '1'];
      const text = document.createElement('div');
      text.classList.add('binary-text');
      
      let binaryString = '';
      const length = Math.floor(Math.random() * 30) + 20;
      
      for (let i = 0; i < length; i++) {
        binaryString += binaryChars[Math.floor(Math.random() * binaryChars.length)];
      }
      
      text.textContent = binaryString;
      
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      text.style.left = `${posX}%`;
      text.style.top = `${posY}%`;
      
      binaryBg.appendChild(text);
      
      gsap.to(text, {
        y: -100,
        opacity: 0,
        duration: duration,
        delay: delay,
        onComplete: function() {
          text.remove();
        }
      });
    };
    
    // Create initial binary texts
    for (let i = 0; i < 10; i++) {
      createBinaryText();
    }
    
    // Create new binary texts periodically
    const binaryInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        createBinaryText();
      }
    }, 2000);

    // Setup intersection observers
    const observerOptions = {
      threshold: 0.2
    };
    
    // Observer for section title
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
      const titleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: 'power3.out'
            });
            titleObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      titleObserver.observe(sectionTitle);
    }
    
    // Observer for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length) {
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = parseFloat(entry.target.getAttribute('data-delay') || 0);
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: delay,
              ease: 'power3.out'
            });
            cardObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      featureCards.forEach(card => {
        cardObserver.observe(card);
      });
    }
    
    // Observer for CTA section
    const ctaElements = document.querySelectorAll('.cta-title, .cta-desc, .cta-btn');
    if (ctaElements.length) {
      const ctaObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = Array.from(ctaElements).indexOf(entry.target);
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.2,
              ease: 'power3.out'
            });
            ctaObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      ctaElements.forEach(element => {
        ctaObserver.observe(element);
      });
    }

    // Glow pulse animation
    const ctaGlow = document.querySelector('.cta-glow');
    if (ctaGlow) {
      gsap.to(ctaGlow, {
        opacity: 0.7,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }

    // Cleanup function
    return () => {
      clearInterval(particleInterval);
      clearInterval(binaryInterval);
    };
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        className="hero" 
        position="relative"
        py="100px" 
        px="30px"
        textAlign="center"
        overflow="hidden"
        bg="linear-gradient(to bottom, #1e293b, #0f172a)"
      >
        <Box className="hero-backdrop" 
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          zIndex="1"
          background="radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1), transparent 60%)"
        />
        <Box className="grid-bg" />
        <Box className="data-particles" id="data-particles" />
        
        <Container className="hero-content" maxW="1000px" position="relative" zIndex="2">
          <Heading
            as="h1"
            fontSize={{base: "36px", md: "48px"}}
            mb="20px"
            opacity="0"
            transform="translateY(30px)"
            className="gradient-text"
          >
            ScrapeSquad - Web Scraping Made Simple
          </Heading>
          <Text 
            fontSize={{base: "16px", md: "18px"}}
            lineHeight="1.6"
            mb="40px"
            maxW="800px"
            mx="auto"
            color="#cbd5e1"
            opacity="0"
            transform="translateY(30px)"
          >
            Extract valuable data from any website with ScrapeSquad's powerful and easy-to-use web scraping tool. Perfect for developers, researchers, and data enthusiasts.
          </Text>
          <Button
            as={RouterLink}
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="action-btn"
            opacity="0"
            transform="translateY(30px)"
            bg="linear-gradient(135deg, #8b5cf6, #d946ef)"
            color="white"
            border="none"
            px="30px"
            py="12px"
            fontSize="16px"
            fontWeight="600"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 5px 15px rgba(139, 92, 246, 0.4)",
              bg: "linear-gradient(135deg, #4c1d95, #831843)",
              color: "white",
              textShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
            }}
          >
            Get Started
          </Button>
        </Container>
        
        <Box className="digital-wave">
          <Box className="wave wave-1" />
          <Box className="wave wave-2" />
        </Box>
      </Box>

      {/* Features Section */}
      <Box 
        className="features" 
        py="80px" 
        px="30px"
        bg="#0f172a"
        position="relative"
      >
        <Box className="binary-bg" id="binary-bg" />
        <Heading 
          className="section-title" 
          textAlign="center"
          fontSize="32px"
          color="#f8fafc"
          mb="60px"
          position="relative"
          opacity="0"
          transform="translateY(20px)"
          _after={{
            content: '""',
            display: 'block',
            width: '80px',
            height: '3px',
            background: 'linear-gradient(90deg, #8b5cf6, #d946ef)',
            margin: '15px auto 0'
          }}
        >
          Why Choose Our Platform?
        </Heading>
        <SimpleGrid 
          className="features-grid"
          columns={{ base: 1, md: 2, lg: 4 }}
          spacing="30px"
          maxW="1200px"
          mx="auto"
          position="relative"
          zIndex="2"
        >
          <Feature
            icon={FaGlobe}
            title="Easy to Use"
            text="Simple interface for scraping any website with just a URL input."
            delay="0"
          />
          <Feature
            icon={FaLock}
            title="Secure"
            text="Your data is protected with industry-standard security measures."
            delay="0.1"
          />
          <Feature
            icon={FaCode}
            title="Developer Friendly"
            text="Access our API with your unique API key for automated scraping."
            delay="0.2"
          />
          <Feature
            icon={FaRocket}
            title="Fast & Reliable"
            text="Quick results with reliable data extraction using modern technology."
            delay="0.3"
          />
        </SimpleGrid>
      </Box>

      {/* CTA Section */}
      <Box 
        className="cta"
        bg="linear-gradient(135deg, #1e293b, #0f172a)"
        py="80px"
        px="30px"
        textAlign="center"
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Box 
          className="cta-glow"
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="500px"
          height="500px"
          background="radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent 70%)"
          borderRadius="50%"
          zIndex="1"
        />
        <Container className="cta-content" position="relative" zIndex="2">
          <Heading
            className="cta-title gradient-text"
            fontSize="32px"
            mb="20px"
            opacity="0"
            transform="translateY(20px)"
          >
            Ready to Start Scraping?
          </Heading>
          <Text
            className="cta-desc"
            fontSize="18px"
            mb="40px"
            maxW="800px"
            mx="auto"
            opacity="0"
            transform="translateY(20px)"
          >
            Join thousands of users who trust our platform for their web scraping needs. Start extracting data today!
          </Text>
          <Button
            as={RouterLink}
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="cta-btn"
            bg="linear-gradient(135deg, #8b5cf6, #d946ef)"
            color="white"
            border="none"
            px="30px"
            py="12px"
            fontSize="16px"
            fontWeight="600"
            opacity="0"
            transform="translateY(20px)"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 5px 15px rgba(139, 92, 246, 0.4)",
              bg: "linear-gradient(135deg, #4c1d95, #831843)",
              color: "white",
              textShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
            }}
          >
            Get Started Now
          </Button>
          <Box 
            as="a" 
            href="https://onranko.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            mt={8}
            opacity={0.8}
            _hover={{ opacity: 1 }}
          >
            <Image 
              src="/Logo-small.png" 
              alt="OnRanko Logo" 
              height="32px" 
              width="auto"
              objectFit="contain"
            />
            <Text 
              fontSize="md" 
              color="#cbd5e1"
              bgGradient="linear(to-r, #8b5cf6, #d946ef)"
              bgClip="text"
              fontWeight="medium"
            >
              Powered by OnRanko
            </Text>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;