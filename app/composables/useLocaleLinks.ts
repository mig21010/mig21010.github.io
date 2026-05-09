import { computed } from 'vue'

export function useLocaleLinks() {
  const { locale, locales } = useI18n()
  const switchLocalePath = useSwitchLocalePath()

  const currentLocale = computed(() => locale.value)

  const links = computed(() =>
    (locales.value as Array<{ code: string; name: string }>).map((l) => ({
      code: l.code,
      label: l.code === 'es' ? 'Es' : 'En',
      path: switchLocalePath(l.code as 'es' | 'en') || '/',
    })),
  )

  return { currentLocale, links }
}
