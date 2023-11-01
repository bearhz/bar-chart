import { configureStore } from '@reduxjs/toolkit'
import contentReducer from '../components/App/contentSlice'
export default configureStore({
  reducer: {
    'content': contentReducer,
  },
})