import styles from './barchart.module.css'
import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux/es/hooks/useSelector';
import * as d3 from "d3";
import { fetchContent } from '../App/contentSlice';
import { useDispatch } from 'react-redux';
import convertToQuarter from '../../commonJS/convertToQuarter';

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
      const padding = 100; // 数据区的外边框。上下左右边框宽度相同。
      const svgWidth = width + padding * 2;
      const svgHeight = height + padding * 2;
      const yOrigin = padding + height; // 0点的y坐标
      const xOrigin = padding; // 0点的x坐标轴
      const yEnd = padding; // 显示数据终点的y坐标
      const xEnd = padding + width; // 显示数据终点的x坐标
      const titlePos = { x: xOrigin + padding * 2.5, y: yEnd };
      const titleText = "United States GDP";
      const yLabel = {
        x: xOrigin + width / 2.8, y: yOrigin + padding / 2,
        text: 'More Information: http://www.bea.gov/national/pdf/nipaguid.pdf'
      };
      const xLabel = { x: xOrigin + 20, y: yEnd + padding * 1.7, text: 'Gross Domestic Product' };
      const dataBox = { w: 140, h: 50, color: 'gray', opacity: 0.4 };
      // console.log(contents);
      // 设置bar宽度
      const barPadding = 0.5; // Padding between bars
      const barWidth = (width - (barPadding * (dataLength - 1))) / dataLength;

      // 获取svg
      const svg = d3.select(refSvg.current)
        .attr('width', svgWidth)
        .attr('height', svgHeight)
      // 获取svg在页面中的位置
      const svgRect = refSvg.current.getBoundingClientRect();
      const svgX = svgRect.left + window.scrollX; // X坐标

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
      let rect = bar.append('rect')
        .attr('fill', '#33ADFF')
        .attr('opacity', 0.6)
        .attr('height', (d, i) => { return yOrigin - yScale(d[1]) })
        .attr('width', barWidth);

      // 添加鼠标事件
      // 创建显示数据窗口
      let dataBoxGroup = svg.append('g');
      let dataBoxRect = dataBoxGroup.append('rect');
      let dataBoxDate = dataBoxGroup.append('text');
      let dataBoxValue = dataBoxGroup.append('text');
      // 处理事件
      rect.on("mouseover", function (event, d) {
        // 获取事件源
        const rect = d3.select(this);
        // console.log(this);// 这里必须要选择rect，后面改变颜色的程序才能正确运行
        // 修改颜色
        rect.attr("fill", "white");

        // 获取鼠标位置
        const x = event.x;
        // 添加数据响应窗口属性：添加位置、颜色和文字
        dataBoxGroup.attr('transform', `translate(${x - svgX + padding * 0.3}, ${yOrigin - padding})`);
        dataBoxRect.attr('width', dataBox.w)
          .attr('height', dataBox.h)
          .attr('fill', dataBox.color)
          .attr('opacity', dataBox.opacity)
        dataBoxDate.text(`${convertToQuarter(d[0])}`)
          .attr('transform', 'translate(0, 20)')
          .classed(styles.dataBox, true);

        // 数据转换成美元显示
        const usd = d[1].toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        });

        dataBoxValue.text(`  ${usd} Billion`)
          .attr('transform', 'translate(0, 40)')
          .classed(styles.dataBox, true);
      })
        .on("mouseout", function (d) {
          d3.select(this).attr("fill", "#33ADFF");
        });
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

      var y_axis = d3.axisLeft(yScale)
        .tickFormat(d3.format('.2s'));

      svg.append('g')
        .attr('transform', `translate(0, ${yOrigin})`)
        .call(x_axis)
        .classed(styles.textFontSizeM, true);

      svg.append('g')
        .attr('transform', `translate(${xOrigin}, 0)`)
        .call(y_axis)
        .classed(styles.textFontSizeM, true);

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
        .attr('d', `M${padding},6V0H${width + padding}`);

      // 添加title
      svg.append('g')
        .attr('transform', `translate(${titlePos.x}, ${titlePos.y})`)
        .append('text')
        .text(titleText)
        .classed(styles.textFontSizeL, true)
      // 添加y label
      svg.append('g')
        .attr('transform', `translate(${yLabel.x}, ${yLabel.y})`)
        .append('text')
        .text(yLabel.text)
        .classed(styles.textFontSizeM, true)
      // 添加x label
      svg.append('g')
        .attr('transform', `translate(${xLabel.x}, ${xLabel.y}) rotate(-90)`)
        .append('text')
        .text(xLabel.text)
        .classed(styles.textFontSizeM, true);
      // 统一设置text font
      svg.selectAll('g')
        .classed(styles.textFont, true);

      return () => {
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