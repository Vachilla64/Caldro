import Caldro from "./Caldro";
import { CaldroCIM, CaldroIH, CaldroKeys, CaldroSSM } from "./Caldro_HelperClasses.js";





export default function SETUP_CALDRO(){
    Caldro.events.currentKeyStateHandler = CaldroKeys
}