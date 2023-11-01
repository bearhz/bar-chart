import { useSelector } from "react-redux/es/hooks/useSelector";
import { useDispatch } from "react-redux";
import { fetchContent } from "./contentSlice";
import { useEffect } from "react";
import styles from './app.module.css'
import BarChart from '../BarChart/BarChart'

function App() {
  const dispatch = useDispatch();
  // const contents = useSelector((state) => state.content.contents);
  const isLoading = useSelector((state) => state.content.isLoading);
  const error = useSelector((state) => state.content.error);

  useEffect(() => {
    dispatch(fetchContent());
  }, [dispatch]);

  if (isLoading) {
    return 'loading...'
  }

  if (error) {
    return error
  }

  return (
    <div className={`${styles.container}`}>
      {/* <p>
        {Object.getOwnPropertyNames(contents).length > 0 ?
          `${contents.data[0][0]}: ${contents.data[0][1]}`
          : 'Data is not ready'}
      </p> */}
      <BarChart></BarChart>
    </div>
  );
}

export default App;
