import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const {
    Link,
    redirect,
    usePathname,
    useRouter,
    getPathname,
    permanentRedirect,
} = createNavigation(routing);