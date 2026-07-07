// src/types/react-quill-new.d.ts
// Temporary module declaration for react-quill-new (no official @types available)
declare module "react-quill-new" {
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

  export default class ReactQuill extends React.Component<ReactQuillProps> {
    // Trả về instance Quill gốc — cần thiết để thao tác trực tiếp với editor
    // (vd: chèn ảnh, lấy Delta, set con trỏ, v.v.)
    getEditor(): any;
  }
}
