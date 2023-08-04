import ClipLoader from "react-spinners/ClipLoader";
import { useState, CSSProperties } from "react";

const override: CSSProperties = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

function TableLoading({ loading }: { loading: boolean }) {
  let [color, setColor] = useState("#273e87");
  return (
    <ClipLoader
      color={color}
      loading={loading}
      cssOverride={override}
      size={150}
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  );
}

export default TableLoading;
