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
  }, [dispatch]);

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
      // console.log('bar length = ', bar._groups[0].length);
      // 创建x坐标轴，只显示5倍数的年份;并输出年份对应的数据序号
      // 创建存储不需要输出的数据序号
      let onIndex = [];
      let onYears = [];
      var x_axis = d3.axisBottom(xScale)
        .tickFormat((d, i) => {
          // 从YYYY-MM-DD转化成YYYY
          d = d.substring(0, 4);
          // 把字符串转化成整数
          const year = parseInt(d);
          // 只保留显示第一个季度的年；并且，如果year是5的整数倍，比如1945或1950，则保留，否则设置为空字符
          if (i % 4 === 0 && year % 5 === 0) {
            onIndex.push(i);
            onYears.push(year);
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

      // 修改坐标轴上的刻度线
      // 通过查看网页的source，可以发现刻度线的元素为svg/g/g.tick/line，通过选择、设置不显示
      svg.selectAll('g.tick line')
        .filter((d, i) => {
          if (!onIndex.includes(i)) {
            return d;
          }
        })
        .style('display', 'none');
      // 修改x的坐标轴线，通过修改path里面的d，去掉最后的V6（向下划线6px），从而删掉终止刻度线
      svg.select('path.domain')
        .attr('d', "M50,6V0H750");

      return ()=>{
        // 更新数据前删除所有过去的内容        
        svg.selectAll('*').remove();
      }
    }
  }, [contents, isLoading])


  return (
    // <div className={`${styles.container} parent`}>
    // </div>
    <div className={`${styles.container}`}>
      <svg ref={refSvg}></svg>
    </div>

  )
}