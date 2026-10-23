// maps an avatar's imageKey to image bundled in app
import blueTang from './assets/fish/blueTang.png'
import linedButterflyfish from './assets/fish/linedButterflyfish.png'
import moorishIdol from './assets/fish/moorishIdol.png'
import orangeClownfish from './assets/fish/orangeClownfish.png'
import schoolingBannerfish from './assets/fish/schoolingBannerfish.png'

export const FISH_IMAGES = {
  blueTang,
  linedButterflyfish,
  moorishIdol,
  orangeClownfish,
  schoolingBannerfish,
}

// shown if server sends key this app doesn't have image for
export const DEFAULT_FISH_KEY = 'blueTang'

export const getFishImage = (key) => FISH_IMAGES[key] ?? FISH_IMAGES[DEFAULT_FISH_KEY]