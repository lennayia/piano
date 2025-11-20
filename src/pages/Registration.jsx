import LoginForm from '../components/auth/LoginForm';
import { Piano, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

function Registration() {
  // KONFIGURACE POZADÍ
  // Můžete použít BUĎTO video NEBO fotku
  const backgroundConfig = {
    type: 'video', // 'image' nebo 'video'

    // Pro fotku:
    image: {
      url: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=1920&h=1080&fit=crop",
      // Pro vlastní fotku: url: "/images/pianist.jpg"
    },

    // Pro video:
    video: {
      url: "/videos/pianist-playing.webm", // Cesta k videu
      // Pokud chcete použít video z URL: url: "https://example.com/video.mp4"
      muted: false, // false = použít zvuk z videa (vypne syntetizovanou Vltavu)
      loop: true,
      playbackRate: 1.0 // Rychlost přehrávání (1.0 = normální)
    }
  };

  // State pro ovládání zvuku videa
  const videoRef = useRef(null);
  const [isVideoMuted, setIsVideoMuted] = useState(true); // Začínáme ztlumeni kvůli autoplay policy

  // Zjistit, zda použít zvuk z videa nebo Vltavu
  const useVideoAudio = backgroundConfig.type === 'video' && !backgroundConfig.video.muted;

  // Funkce pro zapnutí/vypnutí zvuku
  const toggleVideoSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      overflow: 'hidden'
    }}>
      {/* Pozadí - video nebo fotka */}
      {backgroundConfig.type === 'video' ? (
        /* Video pozadí */
        <>
          <video
            ref={videoRef}
            autoPlay
            loop={backgroundConfig.video.loop}
            muted={true} // Začínáme ztlumeni kvůli autoplay policy
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0
            }}
            onLoadedMetadata={(e) => {
              if (backgroundConfig.video.playbackRate) {
                e.target.playbackRate = backgroundConfig.video.playbackRate;
              }
            }}
          >
            <source src={backgroundConfig.video.url} type={backgroundConfig.video.url.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
            Váš prohlížeč nepodporuje video tag.
          </video>

          {/* Tlačítko pro zapnutí/vypnutí zvuku - zobrazí se pouze když chceme zvuk */}
          {!backgroundConfig.video.muted && (
            <button
              onClick={toggleVideoSound}
              style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.5)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isVideoMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
          )}
        </>
      ) : (
        /* Fotka pozadí */
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundConfig.image.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }} />
      )}

      {/* Overlay efekty */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
      }}>
        {/* Tmavý gradient overlay pro lepší čitelnost */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(45, 91, 120, 0.5) 50%, rgba(181, 31, 101, 0.4) 100%)'
        }} />

        {/* Glassmorphism overlay s blur efektem */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)'
        }} />

        {/* Kouřový efekt - animovaný */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)'
          }}
        />

        {/* Další kouřová vrstva */}
        <motion.div
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 70% 60%, rgba(181, 31, 101, 0.2) 0%, transparent 50%)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)'
          }}
        />
      </div>

      {/* Přihlašovací formulář - hlavní obsah */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            textAlign: 'center',
            width: '100%'
          }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            color: '#ffffff',
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Naučte se na piano
          </h1>
          <p style={{
            fontSize: '1.125rem',
            color: '#ffffff',
            opacity: 0.9,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Moderní a zábavný způsob výuky na klavír
          </p>
        </motion.div>

        <LoginForm disableBackgroundMusic={useVideoAudio} />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{
            padding: '1rem 2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            color: 'white',
            fontSize: '0.875rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            textAlign: 'center'
          }}
        >
          <Piano size={20} />
          <span>Naučte se hrát na klavír - zábavně a efektivně</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Registration;
