/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PlotlineLogoProps {
  className?: string;
  /**
   * Optional color override for the mark itself (defaults to currentColor)
   */
  color?: string;
}

/**
 * Plotline "P" Film-Strip Logo Mark
 * Traced directly from the attached reference mark (/assets/aistudio/image_6ea35e19.png)
 * and recolored to match the Geist UI aesthetic (#E7FE55 Electric Lime, #F8D4FE Lavender Pink, #000000 Black, #FFFFFF White).
 */
export const PlotlineLogo: React.FC<PlotlineLogoProps> = ({
  className = 'w-5 h-5',
  color = 'currentColor',
}) => {
  // Helper to generate a slanted rounded-rectangle cutout path (evenodd hole)
  // Top holes & bottom holes share the exact slant of the left stem (dx/dy = -0.175)
  const slantedHole = (xTopLeft: number, yTop: number, width: number, height: number, r: number) => {
    const slant = -0.175;
    const dx = height * slant;
    const x0 = xTopLeft;
    const y0 = yTop;
    const x1 = x0 + width;
    const y1 = y0;
    const x2 = x1 + dx;
    const y2 = y0 + height;
    const x3 = x0 + dx;
    const y3 = y0 + height;

    return [
      `M ${(x0 + r).toFixed(2)} ${y0.toFixed(2)}`,
      `L ${(x1 - r).toFixed(2)} ${y1.toFixed(2)}`,
      `Q ${x1.toFixed(2)} ${y1.toFixed(2)} ${(x1 + r * slant).toFixed(2)} ${(y1 + r).toFixed(2)}`,
      `L ${(x2 - r * slant).toFixed(2)} ${(y2 - r).toFixed(2)}`,
      `Q ${x2.toFixed(2)} ${y2.toFixed(2)} ${(x2 - r).toFixed(2)} ${y2.toFixed(2)}`,
      `L ${(x3 + r).toFixed(2)} ${y3.toFixed(2)}`,
      `Q ${x3.toFixed(2)} ${y3.toFixed(2)} ${(x3 - r * slant).toFixed(2)} ${(y3 - r).toFixed(2)}`,
      `L ${(x0 + r * slant).toFixed(2)} ${(y0 + r).toFixed(2)}`,
      `Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${(x0 + r).toFixed(2)} ${y0.toFixed(2)}`,
      'Z',
    ].join(' ');
  };

  // Outer silhouette of the slanted "P" film strip (normalized 0..100 viewBox)
  const outerPath = [
    'M 25.0 1.0',
    'L 91.0 1.0',
    'Q 96.2 1.0 96.2 6.2',
    'L 96.2 51.0',
    'Q 96.2 56.2 91.0 56.2',
    'L 79.8 56.2',
    'Q 74.3 56.2 73.3 61.8',
    'L 67.8 93.8',
    'Q 66.9 99.0 61.6 99.0',
    'L 7.8 99.0',
    'Q 2.6 99.0 3.5 93.8',
    'L 19.0 6.2',
    'Q 19.9 1.0 25.0 1.0',
    'Z',
  ].join(' ');

  // 3 Top Sprocket Holes
  const topHole1 = slantedHole(27.5, 4.2, 14.8, 13.2, 3.0);
  const topHole2 = slantedHole(52.0, 4.2, 14.8, 13.2, 3.0);
  const topHole3 = slantedHole(76.5, 4.2, 14.8, 13.2, 3.0);

  // 2 Bottom Sprocket Holes
  const bottomHole1 = slantedHole(13.5, 82.6, 14.8, 13.2, 3.0);
  const bottomHole2 = slantedHole(38.0, 82.6, 14.8, 13.2, 3.0);

  const combinedPath = [
    outerPath,
    topHole1,
    topHole2,
    topHole3,
    bottomHole1,
    bottomHole2,
  ].join(' ');

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={combinedPath}
        fill={color}
      />
    </svg>
  );
};
