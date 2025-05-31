import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTooltip } from "../context/TooltipContext";

const GlobalTooltip = () => {
  const { tooltipState, hideTooltip } = useTooltip();
  const tooltipRef = useRef(null);

  // Calculate position when tooltip becomes visible or trigger changes
  useEffect(() => {
    if (
      tooltipState.isVisible &&
      tooltipState.triggerElement &&
      tooltipRef.current
    ) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        calculatePosition();
      });
    }
  }, [
    tooltipState.isVisible,
    tooltipState.triggerElement,
    tooltipState.content,
  ]);

  // Handle scroll and resize events that could affect tooltip positioning
  useEffect(() => {
    if (!tooltipState.isVisible) return;

    const handleScrollOrResize = () => {
      // Recalculate position on scroll/resize
      if (tooltipState.triggerElement && tooltipRef.current) {
        requestAnimationFrame(() => {
          calculatePosition();
        });
      }
    };

    // Add event listeners for scroll and resize
    window.addEventListener("scroll", handleScrollOrResize, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, {
        capture: true,
      });
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [tooltipState.isVisible, tooltipState.triggerElement]);

  const calculatePosition = () => {
    if (!tooltipRef.current || !tooltipState.triggerElement) return;

    const triggerRect = tooltipState.triggerElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const margin = 20;
    const arrowSize = 8;

    // Calculate trigger center coordinates
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const triggerCenterY = triggerRect.top + triggerRect.height / 2;

    // Determine optimal position based on available space
    let optimalPosition = tooltipState.position;
    const spaceTop = triggerRect.top;
    const spaceBottom = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    // Check if preferred position fits, otherwise find best alternative
    const requiredSpace = {
      top: tooltipRect.height + arrowSize + margin,
      bottom: tooltipRect.height + arrowSize + margin,
      left: tooltipRect.width + arrowSize + margin,
      right: tooltipRect.width + arrowSize + margin,
    };

    if (
      requiredSpace[tooltipState.position] >
      getAvailableSpace(
        tooltipState.position,
        spaceTop,
        spaceBottom,
        spaceLeft,
        spaceRight
      )
    ) {
      // Find best alternative position
      const alternatives = [
        { pos: "top", space: spaceTop },
        { pos: "bottom", space: spaceBottom },
        { pos: "left", space: spaceLeft },
        { pos: "right", space: spaceRight },
      ].sort((a, b) => b.space - a.space);

      for (const alt of alternatives) {
        if (requiredSpace[alt.pos] <= alt.space) {
          optimalPosition = alt.pos;
          break;
        }
      }

      // If no position has enough space, use the one with most space
      if (
        requiredSpace[optimalPosition] >
        getAvailableSpace(
          optimalPosition,
          spaceTop,
          spaceBottom,
          spaceLeft,
          spaceRight
        )
      ) {
        optimalPosition = alternatives[0].pos;
      }
    }

    // Calculate tooltip position and arrow position with accurate offset calculation
    const result = calculateTooltipAndArrowPosition(
      optimalPosition,
      triggerRect,
      tooltipRect,
      triggerCenterX,
      triggerCenterY,
      viewportWidth,
      viewportHeight,
      margin
    );

    // Apply styles to tooltip
    Object.assign(tooltipRef.current.style, result.tooltipStyle);

    // Apply styles to arrow with proper cleanup
    const arrow = tooltipRef.current.querySelector(".tooltip-arrow");
    if (arrow) {
      // Clear all positioning properties first to avoid conflicts
      arrow.style.top = "";
      arrow.style.bottom = "";
      arrow.style.left = "";
      arrow.style.right = "";
      arrow.style.transform = "";

      // Apply new styles
      Object.assign(arrow.style, result.arrowStyle);
      arrow.className = `tooltip-arrow ${getArrowClasses(optimalPosition)}`;
    }
  };

  const getAvailableSpace = (
    pos,
    spaceTop,
    spaceBottom,
    spaceLeft,
    spaceRight
  ) => {
    switch (pos) {
      case "top":
        return spaceTop;
      case "bottom":
        return spaceBottom;
      case "left":
        return spaceLeft;
      case "right":
        return spaceRight;
      default:
        return 0;
    }
  };

  const calculateTooltipAndArrowPosition = (
    pos,
    triggerRect,
    tooltipRect,
    triggerCenterX,
    triggerCenterY,
    viewportWidth,
    viewportHeight,
    margin
  ) => {
    const tooltipStyle = { position: "fixed", zIndex: 50 };
    // Clear all positioning properties to avoid conflicts when switching positions
    const arrowStyle = {
      position: "absolute",
      top: "auto",
      bottom: "auto",
      left: "auto",
      right: "auto",
      transform: "none",
    };
    const arrowOffset = 12;
    const arrowSize = 6; // Arrow border size
    const minArrowMargin = 16; // Minimum distance from tooltip edge

    switch (pos) {
      case "top":
        // Position tooltip above trigger
        tooltipStyle.top = `${
          triggerRect.top - tooltipRect.height - arrowOffset
        }px`;
        tooltipStyle.left = `${Math.max(
          margin,
          Math.min(
            triggerCenterX - tooltipRect.width / 2,
            viewportWidth - tooltipRect.width - margin
          )
        )}px`;

        // Calculate arrow horizontal position relative to tooltip
        const tooltipLeft = parseFloat(tooltipStyle.left);
        const arrowLeftOffset = Math.max(
          minArrowMargin,
          Math.min(
            triggerCenterX - tooltipLeft,
            tooltipRect.width - minArrowMargin
          )
        );

        // Reset conflicting properties and set arrow position
        arrowStyle.bottom = "auto";
        arrowStyle.right = "auto";
        arrowStyle.top = "100%";
        arrowStyle.left = `${arrowLeftOffset}px`;
        arrowStyle.transform = "translateX(-50%)";
        break;

      case "bottom":
        // Position tooltip below trigger
        tooltipStyle.top = `${triggerRect.bottom + arrowOffset}px`;
        tooltipStyle.left = `${Math.max(
          margin,
          Math.min(
            triggerCenterX - tooltipRect.width / 2,
            viewportWidth - tooltipRect.width - margin
          )
        )}px`;

        // Calculate arrow horizontal position relative to tooltip
        const tooltipLeftBottom = parseFloat(tooltipStyle.left);
        const arrowLeftOffsetBottom = Math.max(
          minArrowMargin,
          Math.min(
            triggerCenterX - tooltipLeftBottom,
            tooltipRect.width - minArrowMargin
          )
        );

        // Reset conflicting properties and set arrow position
        arrowStyle.top = "auto";
        arrowStyle.right = "auto";
        arrowStyle.bottom = "100%";
        arrowStyle.left = `${arrowLeftOffsetBottom}px`;
        arrowStyle.transform = "translateX(-50%)";
        break;

      case "left":
        // Position tooltip to the left of trigger
        tooltipStyle.left = `${
          triggerRect.left - tooltipRect.width - arrowOffset
        }px`;
        tooltipStyle.top = `${Math.max(
          margin,
          Math.min(
            triggerCenterY - tooltipRect.height / 2,
            viewportHeight - tooltipRect.height - margin
          )
        )}px`;

        // Calculate arrow vertical position relative to tooltip
        const tooltipTop = parseFloat(tooltipStyle.top);
        const arrowTopOffset = Math.max(
          minArrowMargin,
          Math.min(
            triggerCenterY - tooltipTop,
            tooltipRect.height - minArrowMargin
          )
        );

        // Reset conflicting properties and set arrow position
        arrowStyle.bottom = "auto";
        arrowStyle.right = "auto";
        arrowStyle.left = "100%";
        arrowStyle.top = `${arrowTopOffset}px`;
        arrowStyle.transform = "translateY(-50%)";
        break;

      case "right":
        // Position tooltip to the right of trigger
        tooltipStyle.left = `${triggerRect.right + arrowOffset}px`;
        tooltipStyle.top = `${Math.max(
          margin,
          Math.min(
            triggerCenterY - tooltipRect.height / 2,
            viewportHeight - tooltipRect.height - margin
          )
        )}px`;

        // Calculate arrow vertical position relative to tooltip
        const tooltipTopRight = parseFloat(tooltipStyle.top);
        const arrowTopOffsetRight = Math.max(
          minArrowMargin,
          Math.min(
            triggerCenterY - tooltipTopRight,
            tooltipRect.height - minArrowMargin
          )
        );

        // Reset conflicting properties and set arrow position
        arrowStyle.bottom = "auto";
        arrowStyle.left = "auto";
        arrowStyle.right = "100%";
        arrowStyle.top = `${arrowTopOffsetRight}px`;
        arrowStyle.transform = "translateY(-50%)";
        break;
    }

    return { tooltipStyle, arrowStyle };
  };

  const getTooltipClasses = () => {
    const baseClasses = `
      px-5 py-4 text-sm font-medium leading-relaxed
      text-gray-900 dark:text-gray-100
      bg-white/95 dark:bg-gray-900/95
      backdrop-blur-xl backdrop-saturate-150
      rounded-xl border border-gray-200/80 dark:border-gray-700/80
      shadow-2xl shadow-gray-900/10 dark:shadow-black/30
      transition-all duration-200 ease-out pointer-events-none
      ${
        tooltipState.isVisible
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 translate-y-1"
      }
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-br before:from-white/20 before:to-transparent
      before:pointer-events-none dark:before:from-white/5
      ring-1 ring-gray-900/5 dark:ring-white/10
    `;

    return `${baseClasses} ${tooltipState.className}`;
  };

  const getArrowClasses = (position) => {
    const baseArrowClasses = `
      border-[6px] border-transparent transition-all duration-200 ease-out
      drop-shadow-sm relative
    `;

    const arrowClasses = {
      top: `${baseArrowClasses}
        border-t-white/95 dark:border-t-gray-900/95
        after:absolute after:border-[6px] after:border-transparent
        after:border-t-gray-200/80 after:dark:border-t-gray-700/80
        after:top-[-7px] after:left-[-6px] after:z-[-1]
      `,
      bottom: `${baseArrowClasses}
        border-b-white/95 dark:border-b-gray-900/95
        after:absolute after:border-[6px] after:border-transparent
        after:border-b-gray-200/80 after:dark:border-b-gray-700/80
        after:bottom-[-7px] after:left-[-6px] after:z-[-1]
      `,
      left: `${baseArrowClasses}
        border-l-white/95 dark:border-l-gray-900/95
        after:absolute after:border-[6px] after:border-transparent
        after:border-l-gray-200/80 after:dark:border-l-gray-700/80
        after:left-[-7px] after:top-[-6px] after:z-[-1]
      `,
      right: `${baseArrowClasses}
        border-r-white/95 dark:border-r-gray-900/95
        after:absolute after:border-[6px] after:border-transparent
        after:border-r-gray-200/80 after:dark:border-r-gray-700/80
        after:right-[-7px] after:top-[-6px] after:z-[-1]
      `,
    };

    return arrowClasses[position] || arrowClasses.top;
  };

  // Always render the tooltip, but position it off-screen when not visible
  const offScreenStyle = {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    opacity: "0",
    pointerEvents: "none",
  };

  return createPortal(
    <div
      ref={tooltipRef}
      className={`z-50 ${getTooltipClasses()}`}
      style={{
        ...(tooltipState.isVisible ? {} : offScreenStyle),
        maxWidth: `min(${tooltipState.maxWidth}, calc(100vw - 40px))`,
        minWidth: "400px",
        transform: tooltipState.isVisible
          ? "scale(1) translateY(0)"
          : "scale(0.95) translateY(4px)",
      }}
      role="tooltip"
      aria-hidden={!tooltipState.isVisible}
    >
      <div className="relative z-10">{tooltipState.content}</div>
      <div className="tooltip-arrow absolute z-0" />
    </div>,
    document.body
  );
};

export default GlobalTooltip;
