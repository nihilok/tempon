import "./LoadingSpinner.css";

export function LoadingSpinner(props: { className?: string }) {
  return (
    <div className={"loading-spinner " + (props.className || "")}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
