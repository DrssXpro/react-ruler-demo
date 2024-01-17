import "./app.css";
import FsRulerContainer from "./components/FsRulerContainer";

const App = () => {
  return (
    <div className="container">
      <div className="content-box">
        <div className="content-left"></div>
        <div className="content-center">
          <FsRulerContainer>
            <div>内容</div>
          </FsRulerContainer>
        </div>
        <div className="content-right"></div>
      </div>
    </div>
  );
};

export default App;
