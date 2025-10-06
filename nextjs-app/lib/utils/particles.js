export const initParticles = (containerId) => {
  if (typeof window === 'undefined' || !window.particlesJS) return;

  window.particlesJS(containerId, {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: '#6366f1',
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.3,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#6366f1',
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'grab',
        },
        onclick: {
          enable: true,
          mode: 'push',
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 0.5,
          },
        },
        push: {
          particles_nb: 4,
        },
      },
    },
    retina_detect: true,
  });
};

export const createEmotionParticles = (emotion) => {
  const colors = {
    happy: '#FCD34D',
    sad: '#60A5FA',
    angry: '#F87171',
    surprised: '#A78BFA',
    fearful: '#FB923C',
    disgusted: '#4ADE80',
    neutral: '#9CA3AF',
  };

  return {
    particles: {
      number: {
        value: emotion === 'happy' ? 120 : 60,
      },
      color: {
        value: colors[emotion] || colors.neutral,
      },
      shape: {
        type: emotion === 'happy' ? 'star' : 'circle',
      },
      opacity: {
        value: 0.5,
      },
      size: {
        value: emotion === 'happy' ? 4 : 2,
      },
    },
  };
};
