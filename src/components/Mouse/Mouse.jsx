import { useEffect, useRef } from "react";
import styles from './mouse.module.css'

export default function Mouse() {
  const display = useRef();

  useEffect(() => {
    document.addEventListener("mousemove", function (event) {
      var x = event.clientX;
      var y = event.clientY;
      var coordinatesElement = display.current;

      // 更新坐标显示元素的位置
      coordinatesElement.style.display = "block";
      coordinatesElement.style.left = (x + 10) + "px";
      coordinatesElement.style.top = (y + 30) + "px";
      coordinatesElement.textContent = `(${x}, ${y})`;
    });
  }, [])

  
  return (
    <div className={styles.mouseCoordinates} ref={display}>
    </div>
  )
}