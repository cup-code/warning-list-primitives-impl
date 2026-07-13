// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function generateTitle(key, title) {
  const hasKey = this.$te(`route.${key}`)

  if (hasKey) {
    // $t :this method from vue-i18n, inject in @/lang/index.js
    const translatedTitle = this.$t(`route.${key}`)

    return translatedTitle
  }
  return title
}
