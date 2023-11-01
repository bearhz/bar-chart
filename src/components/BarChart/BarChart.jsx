import styles from './barchart.module.css'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import * as d3 from "d3";

export default function BarChart() {
  const contents = useSelector(state => state.content.contents);
  const refSvg = useRef();

  // 当contents更新时，调用useEffect，运行d3代码
  useEffect(() => {
    if (Object.getOwnPropertyNames(contents).length > 0) {
      const data = contents.data;
      const dataLength = data.length;
      // 得到数据中的最大值
      const dataMaxium = Math.max(...data.map((d) => d[1]));
      // console.log(dataMaxium);

      // 设置svg的窗口尺寸
      const sWidth = 700;
      const sHeight = 400;
      const sPadding = 100;
      // 设置bar宽度
      const barPadding = 0.5; // Padding between bars
      const barWidth = (sWidth - (barPadding * (dataLength - 1))) / dataLength;
      // 设置y scale比例
      const yScale = d3.scaleLinear()
        .domain([0, dataMaxium])
        .range([sHeight, 0]);
      // 设置x scale
      const xScale = d3.scaleBand()
        .domain(data.map(d => d[0]))
        .range([0, sWidth]);

      const parent = d3.select('div.parent');
      // 清除所有子元素
      parent.selectAll('*').remove();
      // 添加svg画布
      const svg = parent.append('svg')
        .attr('width', sWidth + sPadding)
        .attr('height', sHeight + sPadding)
        .attr('x', 0)
        .attr('y', 0);
      // 为每个bar添加group
      var bar = svg.selectAll('g')
        .data(data)
        .join('g')
        // .append('g')
        // 为每个bar设置位置， y轴在svg底部
        .attr('transform', (d, i) => {
          const x = xScale(d[0]);
          const y = yScale(d[1]);
          return 'translate(' + x + ', ' + y + ')';
        })

      // 画bar为矩形
      bar.append('rect')
        .attr('fill', '#33ADFF')
        .attr('opacity', 0.6)
        .attr('height', (d, i) => { return sHeight - yScale(d[1]) })
        .attr('width', barWidth)

      // 添加坐标轴
      var x_axis = d3.axisBottom()
        .scale(xScale)
        .tickFormat((d, i) => {
          const year = d.slice(0, 4);
          
          if (parseInt(year) % 5 === 0) {
            return year;
          } else {
            return ""; // Hide the label
          }
        });
      console.log(x_axis);
      svg.join('g')
        .attr('transform', 'translate(0, ' + sHeight + ')')
        .call(x_axis);

    }
  })


  return (
    // <div className={`${styles.container} parent`}>
    // </div>
    <svg ref={refSvg}></svg>
  )
}