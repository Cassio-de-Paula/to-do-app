import React from "react";
import styles from "./Loading.module.css";

interface LoadingProps {
  size?: number; // tamanho do spinner em pixels
  color?: string; // cor da borda
}

const Loading: React.FC<LoadingProps> = ({ size = 50, color = "#8553FD" }) => {
  return (
    <div
      className={styles.spinner}
      style={{ width: size, height: size, borderColor: `${color} transparent transparent transparent` }}
    />
  );
};

export default Loading;
