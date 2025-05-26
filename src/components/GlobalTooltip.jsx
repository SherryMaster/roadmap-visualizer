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

    // Apply styles to arrow
    const arrow = tooltipRef.current.querySelector(".tooltip-arrow");
    if (arrow) {
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
    const arrowStyle = { position: "absolute" };
    const arrowOffset = 12;

    switch (pos) {
      case "top":
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

        const arrowLeftOffset = Math.max(
          16,
          Math.min(
            triggerCenterX - parseFloat(tooltipStyle.left),
            tooltipRect.width - 16
          )
        );

        arrowStyle.top = "100%";
        arrowStyle.left = `${arrowLeftOffset}px`;
        arrowStyle.transform = "translateX(-50%)";
        break;

      case "bottom":
        tooltipStyle.top = `${triggerRect.bottom + arrowOffset}px`;
        tooltipStyle.left = `${Math.max(
          margin,
          Math.min(
            triggerCenterX - tooltipRect.width / 2,
            viewportWidth - tooltipRect.width - margin
          )
        )}px`;

        const arrowLeftOffsetBottom = Math.max(
          16,
          Math.min(
            triggerCenterX - parseFloat(tooltipStyle.left),
            tooltipRect.width - 16
          )
        );

        arrowStyle.bottom = "100%";
        arrowStyle.left = `${arrowLeftOffsetBottom}px`;
        arrowStyle.transform = "translateX(-50%)";
        break;

      case "left":
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

        const arrowTopOffset = Math.max(
          16,
          Math.min(
            triggerCenterY - parseFloat(tooltipStyle.top),
            tooltipRect.height - 16
          )
        );

        arrowStyle.left = "100%";
        arrowStyle.top = `${arrowTopOffset}px`;
        arrowStyle.transform = "translateY(-50%)";
        break;

      case "right":
        tooltipStyle.left = `${triggerRect.right + arrowOffset}px`;
        tooltipStyle.top = `${Math.max(
          margin,
          Math.min(
            triggerCenterY - tooltipRect.height / 2,
            viewportHeight - tooltipRect.height - margin
          )
        )}px`;

        const arrowTopOffsetRight = Math.max(
          16,
          Math.min(
            triggerCenterY - parseFloat(tooltipStyle.top),
            tooltipRect.height - 16
          )
        );

        arrowStyle.right = "100%";
        arrowStyle.top = `${arrowTopOffsetRight}px`;
        arrowStyle.transform = "translateY(-50%)";
        break;
    }

    return { tooltipStyle, arrowStyle };
  };

  const getTooltipClasses = () => {
    const baseClasses = `
      px-4 py-3 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800
      rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-opacity duration-150 pointer-events-none
      ${tooltipState.isVisible ? "opacity-100" : "opacity-0"}
    `;

    return `${baseClasses} ${tooltipState.className}`;
  };

  const getArrowClasses = (position) => {
    const baseArrowClasses = "border-4 border-transparent";

    const arrowClasses = {
      top: `${baseArrowClasses} border-t-white dark:border-t-gray-800`,
      bottom: `${baseArrowClasses} border-b-white dark:border-b-gray-800`,
      left: `${baseArrowClasses} border-l-white dark:border-l-gray-800`,
      right: `${baseArrowClasses} border-r-white dark:border-r-gray-800`,
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
      }}
      role="tooltip"
      aria-hidden={!tooltipState.isVisible}
    >
      {tooltipState.content}
      <div className="tooltip-arrow" />
    </div>,
    document.body
  );
};

export default GlobalTooltip;
