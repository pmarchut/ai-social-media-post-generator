export const useIsChromeExtension = () =>
  computed(() => useRoute().query.isExtension === 'true');