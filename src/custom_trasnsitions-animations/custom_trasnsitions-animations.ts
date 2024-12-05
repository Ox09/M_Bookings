import { cubicInOut, elasticOut, backOut } from "svelte/easing";


// Custom animations and transitions (*some are not tested)
export const slideModal = (
  node: any,
  { duration = 300, y = -20, delay = 0 }: any
) => {
  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = cubicInOut(t);
      return `
        transform: translateY(${(1 - eased) * y}px);
        opacity: ${eased};
        filter: blur(${(1 - eased) * 2}px);
      `;
    },
  };
};

// Scale and rotate transition for new events
export const popScale = (
  node: any,
  { duration = 400, delay = 0, scale = 0.95 }: any
) => {
  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = elasticOut(t);
      return `
        transform: scale(${scale + (1 - scale) * eased}) 
                  rotate(${(1 - eased) * -1}deg);
        opacity: ${t};
      `;
    },
  };
};

// Slide and fade for list items
export const slideList = (
  node: any,
  { duration = 250, x = 40, delay = 0 }: any
) => {
  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = cubicInOut(t);
      return `
        transform: translateX(${(1 - eased) * x}px);
        opacity: ${eased};
      `;
    },
  };
};

// Fade out and collapse for deleting events
export const collapseDelete = (
  node: Element,
  { duration = 200, delay = 0 }: any
) => {
  const style = getComputedStyle(node);
  const height = parseFloat(style.height);
  const padding = parseFloat(style.padding);

  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = cubicInOut(t);
      return `
        height: ${height * eased}px;
        padding: ${padding * eased}px;
        margin-bottom: ${eased * 12}px;
        transform: scale(${eased});
        opacity: ${eased};
      `;
    },
  };
};

// Stagger animation for loading lists
export const staggerFade = (
  node: any,
  { delay = 0, duration = 200, index = 0 }: any
) => {
  const baseDelay = 50;
  return {
    delay: delay + index * baseDelay,
    duration,
    css: (t: number) => {
      const eased = backOut(t);
      return `
        transform: translateY(${(1 - eased) * 20}px);
        opacity: ${eased};
      `;
    },
  };
};

// Ripple effect for buttons
export const ripple = (
  node: {
    addEventListener: (arg0: string, arg1: (event: any) => void) => void;
    getBoundingClientRect: () => any;
    style: { position: string; overflow: string };
    appendChild: (arg0: HTMLDivElement) => void;
  },
  { duration = 800, color = "rgba(255, 255, 255, 0.7)" }: any
) => {
  node.addEventListener(
    "click",
    (event: { clientX: number; clientY: number }) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const circle = document.createElement("div");
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.cssText = `
      position: absolute;
      left: ${x - radius}px;
      top: ${y - radius}px;
      width: ${diameter}px;
      height: ${diameter}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      transform: scale(0);
      opacity: 1;
      animation: ripple ${duration}ms ease-out forwards;
    `;

      node.style.position = "relative";
      node.style.overflow = "hidden";
      node.appendChild(circle);

      setTimeout(() => circle.remove(), duration);
    }
  );

  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  return {
    destroy() {
      style.remove();
    },
  };
};

// Notification slide
export const notificationSlide = (
  node: any,
  { duration = 300, y = -100, delay = 0 }: any
) => {
  return {
    delay,
    duration,
    css: (t: number) => {
      const eased = elasticOut(t);
      return `
        transform: translateY(${(1 - eased) * y}px);
        opacity: ${eased};
      `;
    },
  };
};

// Custom transitions
export const dialogSlide = (node: any, { duration = 300 }: any) => ({
  duration,
  css: (t: number) => {
    const eased = cubicInOut(t);
    return `
        opacity: ${eased};
        filter: blur(${(1 - eased) * 2}px);
      `;
  },
});

export const eventSlide = (
  node: any,
  { duration = 300, delay = 0, index = 0 }: any
) => ({
  duration,
  delay: delay + index * 50, // Stagger effect
  css: (t: number) => {
    const eased = elasticOut(t);
    return `
        transform: translateX(${(1 - eased) * 30}px);
        opacity: ${eased};
      `;
  },
});

export const deleteSlide = (node: Element, { duration = 200 }: any) => {
  const style = getComputedStyle(node);
  const height = parseFloat(style.height);

  return {
    duration,
    css: (t: number) => `
        height: ${height * t}px;
        opacity: ${t};
        transform: translateX(${(1 - t) * 30}px);
        margin-bottom: ${t * 12}px;
      `,
  };
};
