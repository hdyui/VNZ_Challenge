// Temporary module declaration for react-quill (no official @types available)
declare module "react-quill" {
  import * as React from "react";

  type QuillChangeHandler = (
    content: string,
    delta?: any,
    source?: any,
    editor?: any,
  ) => void;

  interface ReactQuillProps {
    value?: any;
    onChange?: QuillChangeHandler;
    modules?: any;
    formats?: any;
    theme?: string;
    placeholder?: string;
    className?: string;
    [key: string]: any;
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}
