// maps an item's imageKey to image bundled in app
import headphones from './assets/items/headphones.png'

export const ITEM_IMAGES = {
  headphones
}

// shown if server sends key this app doesn't have image for
export const DEFAULT_ITEM_KEY = 'headphones'

export const getItemImage = (key) => ITEM_IMAGES[key] ?? ITEM_IMAGES[DEFAULT_ITEM_KEY]