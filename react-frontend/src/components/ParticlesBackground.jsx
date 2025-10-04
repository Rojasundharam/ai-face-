import { useEffect } from 'react';

const ParticlesBackground = () => {
  useEffect(() => {
    // Load particles.js script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
    script.async = true;
    script.onload = () => {
      if (window.particlesJS) {
        window.particlesJS('particles-js', {
          particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: '#6366f1' },
            shape: { type: 'circle' },
            opacity: {
              value: 0.3,
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1 }
            },
            size: {
              value: 3,
              random: true,
              anim: { enable: true, speed: 2, size_min: 0.1 }
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#6366f1',
              opacity: 0.2,
              width: 1
            },
            move: {
              enable: true,
              speed: 1,
              direction: 'none',
              random: true,
              out_mode: 'out'
            }
          },
          interactivity: {
            events: {
              onhover: { enable: true, mode: 'grab' },
              onclick: { enable: true, mode: 'push' }
            },
            modes: {
              grab: { distance: 140 },
              push: { particles_nb: 4 }
            }
          },
          retina_detect: true
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      id="particles-js"
      className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-20"
    />
  );
};

export default ParticlesBackground;
