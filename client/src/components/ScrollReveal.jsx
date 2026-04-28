import { useEffect, useRef } from 'react';

/**
 * ScrollReveal — Lightweight scroll-triggered animation wrapper.
 * Adds 'visible' class when element enters viewport.
 * 
 * Usage:
 *   <ScrollReveal>        → fadeUp
 *   <ScrollReveal direction="left">  → slideInLeft
 *   <ScrollReveal direction="scale"> → scaleIn
 *   <ScrollReveal delay={200}>       → 200ms delay
 *   <ScrollReveal stagger>           → stagger children
 */
function ScrollReveal({ children, direction = 'up', delay = 0, stagger = false, className = '', threshold = 0.15 }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Apply delay if specified
                    if (delay > 0) {
                        setTimeout(() => el.classList.add('visible'), delay);
                    } else {
                        el.classList.add('visible');
                    }
                    observer.unobserve(el); // Only animate once
                }
            },
            { threshold, rootMargin: '0px 0px -50px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [delay, threshold]);

    const directionClass = {
        up: 'reveal',
        left: 'reveal-left',
        right: 'reveal-right',
        scale: 'reveal-scale',
    }[direction] || 'reveal';

    return (
        <div
            ref={ref}
            className={`${directionClass} ${stagger ? 'stagger-children' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

export default ScrollReveal;
