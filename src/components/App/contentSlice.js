import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios';

export const fetchContent = createAsyncThunk(
  'content/fetchContent',
  async () => {
    try {
      //发出HTTP GET请求，设置超时为2s
      const response = await axios({
        timeout: 4000,
        method: "GET",
        url: 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json'
      });

      // 读取返回状态，如果不是200，抛出错误
      if(response.status !== 200){
        console.log(response.status);
        // throw new Error(`Response status is ${response.status}`);
      }

      // 读取返回数据并返回给回调
      const data = await response.data;
      // console.log(data);
      return data
    } catch (error) {
      // 如果HTTP返回错误，则输出错误
      // console.log(error);
    }
  }
)

export const contentSlice = createSlice({
  name: 'content',
  // 状态：数据、是否在加载、错误
  initialState: {
    contents: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // 如果抓取数据状态为pending，更改state的isLoading为真；其他情况，更改isLoading为假
    builder.addCase(fetchContent.pending, (state) => {
      state.isLoading = true;
    })
    // 如果成功抓取数据，将抓取数据赋值给contents
    builder.addCase(fetchContent.fulfilled, (state, action) => {
      state.isLoading = false;
      state.contents = action.payload
    })
    // 如果抓取失败，将错误信息赋值给error
    builder.addCase(fetchContent.rejected, (state, action) => {
      state.isLoading = false
      state.error = action.error.message
    })
  },
})

// Action creators are generated for each case reducer function
// export const {} = contentSlice.actions

export default contentSlice.reducer