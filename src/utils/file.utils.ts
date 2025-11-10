import { ParamType } from "../models/type/ParamType";

export const allowedFileExtensions = (
  filesFromParams: ParamType[]
) => {
  const extensions = filesFromParams.map((p) => `.${p.string2}`);
  return extensions.join(", ");
};
