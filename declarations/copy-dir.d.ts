/// <reference types="node" />

declare module 'copy-dir' {
  import { PathLike, Mode } from 'fs';

  type CopyDirFilter = (
    state: 'file' | 'directory' | 'symbolicLink',
    filePath: string,
    fileName: string
  ) => boolean;

  export type CopyDirOptions = {
    /**
     * Keep `addTime` or `modifyTime` if true, or use the times in the given object.
     */
    utimes?:
      | boolean
      | {
          atime: string | number | Date;
          mtime: string | number | Date;
        };

    /**
     * Keep file mode if true, or use the given mode
     */
    mode?: boolean | Mode;

    /**
     * Cover if file exists
     */
    cover?: boolean;

    /**
     * File filter
     */
    filter?: CopyDirFilter;
  };

  function copydir(
    src: PathLike,
    dest: PathLike,
    callback: (err: NodeJS.ErrnoException | null) => void
  ): void;

  function copydir(
    src: PathLike,
    dest: PathLike,
    options: CopyDirOptions,
    callback: (err: NodeJS.ErrnoException | null) => void
  ): void;

  namespace copydir {
    function sync(
      src: PathLike,
      dest: PathLike,
      options?: CopyDirOptions
    ): void;
  }

  export = copydir;
}
