import React, { CSSProperties } from 'react';

interface HZLayoutProps {
  children?: React.ReactNode;
  xalign?: number; // -1 to 1
  yalign?: number; // -1 to 1
  xoffset?: number;
  yoffset?: number;
  xanchor?: number; // -1 to 1
  yanchor?: number; // -1 to 1
  width?: string;
  height?: string;
  alpha?: number;
}

const HZLayout: React.FC<HZLayoutProps> = ({
  children,
  xalign = 0,
  yalign = 0,
  xoffset = 0,
  yoffset = 0,
  xanchor = 0,
  yanchor = 0,
  width,
  height,
  alpha = 1,
}) => {
  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    opacity: alpha
  };

  const boxStyle: CSSProperties = {
    position: 'absolute',
    transform: `translate(${xanchor * -50}%, ${yanchor * -50}%)`,
    // top: `calc(50% + ${yalign * 50}% + ${yoffset}px)`,
    // left: `calc(50% + ${xalign * 50}% + ${xoffset}px)`,
    width: width || 'auto',
    height: height || 'auto'
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        {children}
      </div>
    </div>
  );
};

export default HZLayout;
