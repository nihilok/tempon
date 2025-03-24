import styles from "./Player.module.css";
import classNames from "classnames";

export function Player(props: { className?: string; src?: string }) {
  return (
    <div className={classNames(styles.player, props.className || "")}>
      {/*<img src="http://192.168.1.232" alt="Camera" />*/}
      <img src={props.src} alt="Camera" />
    </div>
  );
}
