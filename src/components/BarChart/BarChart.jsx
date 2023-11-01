import styles from './barchart.module.css'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import * as d3 from "d3";
import { fetchContent } from '../App/contentSlice';
import { useDispatch } from 'react-redux';

export default function BarChart() {
  const dispatch = useDispatch();
  const contents = useSelector(state => state.content.contents);
  const isLoading = useSelector(state => state.content.isLoading);
  const refSvg = useRef();

  // 加载DOM后发HTTP请求获取数据
  useEffect(() => {
    dispatch(fetchContent());
  }, []);

  // 当contents更新时，调用useEffect，运行d3代码
  useEffect(() => {
    if (contents && !isLoading) {
      // console.log(contents);
      let data = contents.data;
      // let data = contents.data.slice(0, 20);

      // data = data.map((d, i) => [d[0], 100]); // 测试：生成虚拟数据

      const dataLength = data.length;
      // 得到数据中的最大值
      const dataMaxium = Math.max(...data.map((d) => d[1]));
      // console.log(dataMaxium);

      // 设置svg和bar的尺寸
      const width = 700; // 数据显示宽度
      const height = 400; // 数据显示高度
      const padding = 50; // 数据区的外边框。上下左右边框宽度相同。
      const svgWidth = width + padding * 2;
      const svgHeight = height + padding * 2;
      const yOrigin = padding + height; // 0点的y坐标
      const xOrigin = padding; // 0点的x坐标轴
      const yEnd = padding; // 显示数据终点的y坐标
      const xEnd = padding + width; // 显示数据终点的x坐标
      // 设置bar宽度
      const barPadding = 0.5; // Padding between bars
      const barWidth = (width - (barPadding * (dataLength - 1))) / dataLength;

      // 获取svg
      const svg = d3.select(refSvg.current)
        .attr('width', svgWidth)
        .attr('height', svgHeight)

      // 设置y scale比例
      const yScale = d3.scaleLinear()
        .domain([0, dataMaxium])
        .range([yOrigin, yEnd]);

      // 设置x scale
      const xScale = d3.scaleBand()
        .domain(data.map(d => d[0]))
        .range([xOrigin, xEnd]);

      // 为每个bar添加group
      var bar = svg.selectAll('g')
        .data(data)
        // .join('g')
        .enter()
        .append('g')
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
        .attr('height', (d, i) => { return yOrigin - yScale(d[1]) })
        .attr('width', barWidth)

      // 创建x坐标轴
      var x_axis = d3.axisBottom(xScale)
        .tickFormat((d, i) => {
          d = d.substring(0, 4);
          if (i % 20 === 0) {
            d = d;
          } else {
            d = '';
          }
          return d;
        });

      var y_axis = d3.axisLeft(yScale);

      svg.append('g')
        .attr('transform', `translate(0, ${yOrigin})`)
        .call(x_axis);

      svg.append('g')
        .attr('transform', `translate(${xOrigin}, 0)`)
        .call(y_axis);
    }
  }, [contents])


  return (
    // <div className={`${styles.container} parent`}>
    // </div>
    <div className={`${styles.container}`}>
      <svg ref={refSvg}></svg>
    </div>

  )
}