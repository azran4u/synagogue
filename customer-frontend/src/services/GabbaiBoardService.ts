import { gabbaiBoardMapper } from "../model/GabbaiBoard";
import { GenericService } from "./genericService";

export const gabbaiBoardService = new GenericService(
  "/settings/gabbaiBoard",
  gabbaiBoardMapper
);
