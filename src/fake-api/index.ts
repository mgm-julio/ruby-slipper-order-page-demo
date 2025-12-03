import { setupWorker } from 'msw/browser'

// Handlers
import { handlerAppBarSearch } from './handlers/app-bar-search/index'
import { handlerAppsAcademy } from './handlers/apps/academy/index'
import { handlerAppsCalendar } from './handlers/apps/calendar/index'
import { handlerAppsChat } from './handlers/apps/chat/index'
import { handlerAppsEcommerce } from './handlers/apps/ecommerce/index'
import { handlerAppsEmail } from './handlers/apps/email/index'
import { handlerAppsInvoice } from './handlers/apps/invoice/index'
import { handlerAppsKanban } from './handlers/apps/kanban/index'
import { handlerAppLogistics } from './handlers/apps/logistics/index'
import { handlerAppsPermission } from './handlers/apps/permission/index'
import { handlerAppsUsers } from './handlers/apps/users/index'
import { handlerAuth } from './handlers/auth/index'
import { handlerDashboard } from './handlers/dashboard/index'
import { handlerPagesDatatable } from './handlers/pages/datatable/index'
import { handlerPagesFaq } from './handlers/pages/faq/index'
import { handlerPagesHelpCenter } from './handlers/pages/help-center/index'
import { handlerPagesProfile } from './handlers/pages/profile/index'

const worker = setupWorker(
  ...handlerAppsEcommerce,
  ...handlerAppsAcademy,
  ...handlerAppsInvoice,
  ...handlerAppsUsers,
  ...handlerAppsEmail,
  ...handlerAppsCalendar,
  ...handlerAppsChat,
  ...handlerAppsPermission,
  ...handlerPagesHelpCenter,
  ...handlerPagesProfile,
  ...handlerPagesFaq,
  ...handlerPagesDatatable,
  ...handlerAppBarSearch,
  ...handlerAppLogistics,
  ...handlerAuth,
  ...handlerAppsKanban,
  ...handlerDashboard
)

export default function () {
  const enabled = import.meta.env.VITE_ENABLE_FAKE_API === 'true'
  if (!enabled) {
    return
  }

  const workerUrl = `${import.meta.env.BASE_URL ?? '/'}mockServiceWorker.js`
  worker.start({
    serviceWorker: {
      url: workerUrl,
    },
    onUnhandledRequest: 'bypass',
  })
}
