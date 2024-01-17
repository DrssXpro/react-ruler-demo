import { useEffect, useMemo, useRef, useState } from "react";
import Ruler from "@scena/react-ruler";
import "./ruler.css";

interface IFsRulerContainer {
  children: JSX.Element;
}

const FsRulerContainer = (props: IFsRulerContainer) => {
  const { children } = props;
  const [width] = useState(1920);
  const [height] = useState(1080);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [scale, setScale] = useState(1);
  const verticalRulerRef = useRef<null | Ruler>(null);
  const horizontalRulerRef = useRef<null | Ruler>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  let startX = 0,
    startY = 0;

  useEffect(() => {
    dragCanvas();
    autoLayoutCanvas();
    window.addEventListener("resize", handlePageResize);
    containerRef.current!.addEventListener("wheel", handleWheel, { passive: false });
  }, []);

  useEffect(() => {
    canvasRef.current && handleScroll();
  }, [scale]);

  const computedUnit = useMemo(() => {
    if (scale > 1.5) return 25;
    else if (scale > 0.75 && scale <= 1.5) return 50;
    else if (scale > 0.4 && scale <= 0.75) return 100;
    else if (scale > 0.2 && scale <= 0.4) return 200;
    else return 400;
  }, [scale]);

  const computedDis = () => {
    const containerRect = containerRef.current!.getBoundingClientRect();
    const canvasRect = canvasRef.current!.getBoundingClientRect();
    const disX = Math.floor(containerRect.left) - Math.floor(canvasRect.left);
    const disY = Math.floor(containerRect.top) - Math.floor(canvasRect.top);
    return { disX, disY };
  };

  const handleScroll = () => {
    const { disX, disY } = computedDis();
    setPosX(Math.floor(disX / scale));
    setPosY(Math.floor(disY / scale));
  };

  const handleWheel = (e: any) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if (e.wheelDelta > 0) {
        setScale((pre) => {
          if (pre >= 2) return pre;
          return pre + 0.1;
        });
      } else if (e.wheelDelta < 0) {
        setScale((pre) => {
          if (pre <= 0.5) return pre;
          return pre - 0.1;
        });
      }
    }
  };

  const dragCanvas = () => {
    canvasRef.current?.addEventListener("mousedown", (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      startX = e.pageX + containerRef.current!.scrollLeft;
      startY = e.pageY + containerRef.current!.scrollTop;
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    });
  };

  const handleMouseMove = (e: any) => {
    containerRef.current!.scrollLeft = startX - e.pageX;
    containerRef.current!.scrollTop = startY - e.pageY;
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const autoLayoutCanvas = () => {
    const containerWidth = containerRef.current!.clientWidth - 40;
    const containerHeight = containerRef.current!.clientHeight;

    const containerRatio = parseFloat((containerWidth / containerHeight).toFixed(3));
    const canvasRatio = parseFloat((width / height).toFixed(3));
    let scale = 1;
    if (canvasRatio > containerRatio) {
      const scaleWidth = parseFloat((containerWidth / width).toFixed(3));
      scale = scaleWidth > 1 ? 1 : scaleWidth;
    } else {
      const scaleHeight = parseFloat((containerHeight / height).toFixed(3));
      scale = scaleHeight > 1 ? 1 : scaleHeight;
    }
    setScale(scale);
    setLayoutPos(scale);
  };

  const setLayoutPos = (scale: number) => {
    const { disX, disY } = computedDis();
    containerRef.current!.scrollLeft += -disX - 20;
    containerRef.current!.scrollTop +=
      -disY - (containerRef.current!.clientHeight - canvasRef.current!.clientHeight * scale) / 2;
  };

  const handlePageResize = () => {
    verticalRulerRef.current?.resize();
    horizontalRulerRef.current?.resize();
  };

  return (
    <div className="fs-ruler-container">
      <div className="left">
        <div className="px-box">px</div>
        <Ruler
          ref={verticalRulerRef}
          type="vertical"
          lineColor={"#aaa"}
          textColor={"#000"}
          backgroundColor={"#fff"}
          negativeRuler={true}
          zoom={scale}
          scrollPos={posY}
          unit={computedUnit}
          segment={2}
          textOffset={[10, 0]}
        />
      </div>
      <div className="right">
        <div style={{ height: "20px" }}>
          <Ruler
            type="horizontal"
            ref={horizontalRulerRef}
            lineColor={"#aaa"}
            textColor={"#000"}
            backgroundColor={"#fff"}
            negativeRuler={true}
            zoom={scale}
            scrollPos={posX}
            unit={computedUnit}
            segment={2}
            textOffset={[0, 10]}
          />
        </div>
        <div className="content-container" ref={containerRef} onScroll={handleScroll}>
          <button
            className="content-button"
            onClick={() => {
              autoLayoutCanvas();
            }}
          >
            自适应布局
          </button>
          <div className="content-layout" style={{ width: `${width * 2}px`, height: `${height * 2}px` }}>
            <div
              className="content-canvas"
              ref={canvasRef}
              style={{
                width: `${width}px`,
                height: `${height}px`,
                transform: `scale(${scale})`,
                marginLeft: `-${Math.floor(width / 2)}px`,
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FsRulerContainer;
