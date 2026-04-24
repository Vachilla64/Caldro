import { ImageHandler, SpriteSheetManager } from "./Caldro_Image";
import { CanvasImageManager } from "./Caldro_Image_Canvas_Manager";
import { KeyStateHandler } from "./input/Caldro_KeyStateHandler";



// export const CaldroCam = new Camera()
export const CaldroSSM = new SpriteSheetManager();
export const CaldroCIM = new CanvasImageManager();
export const CaldroIH = new ImageHandler();
export const CaldroKeys = new KeyStateHandler();