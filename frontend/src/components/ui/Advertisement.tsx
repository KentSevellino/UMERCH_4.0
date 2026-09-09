import { useRef, useEffect } from 'react';
import CHSE from '../../assets/images/CHSE.svg';
import CTE from '../../assets/images/CTE-LOGO.svg';
import CHE from '../../assets/images/CHE.svg';
import CEE from '../../assets/images/CEE.svg';
import CCJE from '../../assets/images/CCJE.svg';
import CCE from '../../assets/images/CCE.svg';
import CBAE from '../../assets/images/CBAE.svg';
import CASE from '../../assets/images/CASE.svg';
import CAFAE from '../../assets/images/CAFAE.svg';
import CAE from '../../assets/images/CAE.svg';

const Images = [
    CHSE,
    CTE,
    CHE,
    CEE,
    CCJE,
    CCE,
    CBAE,
    CASE,
    CAFAE,
    CAE
];

export default function Advertisement() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animId: number;
    let offset = 0;
    const speed = 0.6;

    const animate = () => {
      offset += speed;
      const half = track.scrollWidth / 2;
      if (offset >= half) offset = 0;
      track.style.transform = `translateX(-${offset}px)`;
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const renderSet = (prefix: string) =>
    Images.map((img, idx) => (
      <img
        key={`${prefix}-${idx}`}
        src={img}
        alt={`Logo ${idx}`}
        draggable={false}
        loading="eager"
        className="h-[120px] w-auto mx-6 shrink-0"
      />
    ));

  return (
    <div className="mt-6 w-full overflow-hidden bg-white hidden lg:block h-[120px]">
      <div ref={trackRef} className="flex items-center h-full">
        {renderSet('a')}
        {renderSet('b')}
      </div>
    </div>
  );
}
