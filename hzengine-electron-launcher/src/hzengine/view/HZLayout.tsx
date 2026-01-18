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

  const convertToRem = (val: string | number | undefined) => {
    if (val === undefined) return 'auto';
    if (typeof val === 'number') return `${val / 16}rem`;
    if (typeof val === 'string' && val.endsWith('px')) {
      const pxVal = parseFloat(val);
      return `${pxVal / 16}rem`;
    }
    return val;
  };

  const boxStyle: CSSProperties = {
    position: 'absolute',
    transform: `translate(${xanchor * -50 - 50}%, ${yanchor * -50 - 50}%)`,
    top: `calc(${yalign * 50 + 50}% + ${yoffset / 16}rem)`,
    left: `calc(${xalign * 50 + 50}% + ${xoffset / 16}rem)`,
    width: convertToRem(width),
    height: convertToRem(height)
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
