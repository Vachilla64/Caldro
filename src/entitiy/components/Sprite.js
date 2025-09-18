class Sprite_Component {
    constructor(image, zIndex = 1, layer = 1){
        if(typeof image == "string"){
            let src = image   
            image = new Image()
            image.src = src
        }
        
        this.image = image;
        this.zIndex = zIndex;
        this.layer = layer; 
    }
}