// Environment backgrounds are plain images dropped into src/assets/environment/.
// Name a file after the room and it is picked up automatically (no code change):
//   mapBackground.jpg, tankBackground.jpg, libraryBackground.jpg, gamesBackground.jpg
// (.jpg, .jpeg, .png and .webp all work). A room with no image yet falls back
// to the matching CSS gradient (.env-map, .env-tank, ...) in index.css.
const environmentFiles = import.meta.glob('./assets/environment/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
  query: '?url',
})

// { mapBackground: '/assets/mapBackground-abc123.jpg', ... }
const ENVIRONMENT_URLS = Object.fromEntries(
  Object.entries(environmentFiles).map(([filePath, url]) => [
    filePath.split('/').pop().replace(/\.[^.]+$/, ''),
    url,
  ]),
)

// url for a room's background, or undefined if that image hasn't been added yet
export const getEnvironmentUrl = (name) => ENVIRONMENT_URLS[name]

// inline style that applies the background image when it exists
export const environmentStyle = (name) => {
  const url = getEnvironmentUrl(name)
  return url ? { backgroundImage: `url("${url}")` } : undefined
}
