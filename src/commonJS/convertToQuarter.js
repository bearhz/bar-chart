function convertToQuarter(dateString) {
  // 解析日期字符串
  const dateParts = dateString.split('-');
  if (dateParts.length !== 3) {
    return "无效的日期格式";
  }

  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  // const day = parseInt(dateParts[2]);

  // 确保月份为11
  if (month > 12 || month <1) {
    return "无效的月份";
  }

  // 计算季度
  const quarter = Math.ceil(month / 3);

  return year + " Q" + quarter;
}

export default convertToQuarter;