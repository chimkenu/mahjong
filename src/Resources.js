class Resources {
  constructor() {
    // all images/sprites to load
    this.toLoad = {
      background: "/tiles.png"
    }

    // 'bucket' - stores all the images in memory
    this.images = {};

    // actually load each image
    Object.keys(this.toLoad).forEach(key => {
      const image = new Image();
      image.src = this.toLoad[key];
      this.images[key] = {
        images: image,
        isLoaded: false
      }
      image.onload = () => {
        this.images[key].isLoaded = true;
      }
    });
  }
}

// make one instance for the whole game to use
export const resources = new Resources();

