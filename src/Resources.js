class Resources {
  constructor() {
    // all images/sprites to load
    this.toLoad = {
      background: "/background.png",
      tiles: "/tiles.png"
    }

    // 'bucket' - stores all the images in memory
    this.images = {};

    // actually load each image
    Object.keys(this.toLoad).forEach(key => {
      const img = new Image();
      img.src = this.toLoad[key];
      this.images[key] = {
        image: img,
        isLoaded: false
      }
      img.onload = () => {
        this.images[key].isLoaded = true;
      }
    });
  }
}

// make one instance for the whole game to use
export const resources = new Resources();

