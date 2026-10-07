import { SML } from "../sml";
for (const type of ["dec_empty", "spec_empty"]) {
    SML.forBlock[type] = () => ["", SML.ORDER_NONE];
}
