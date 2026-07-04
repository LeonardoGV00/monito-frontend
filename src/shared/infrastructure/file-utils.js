export function isImageFile(file) {
  return Boolean(file && typeof file.type === 'string' && file.type.startsWith('image/'))
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('No fue posible leer la imagen.'))
    reader.readAsDataURL(file)
  })
}
