import { useEffect } from 'react'
import { ScrollTrigger } from './animations/gsap'
import { FxLayer } from './components/atmosphere/FxLayer'
import { Navigation } from './components/navigation/Navigation'
import { auditConfig } from './lib/configAudit'
import { CelebrationsSection } from './sections/CelebrationsSection'
import { DateSection } from './sections/DateSection'
import { FinaleSection } from './sections/FinaleSection'
import { IntroSection } from './sections/IntroSection'
import { InvitationSection } from './sections/InvitationSection'
import { StorySection } from './sections/StorySection'
import { TravelSection } from './sections/TravelSection'
import { WishesSection } from './sections/WishesSection'

function App() {
  useEffect(() => {
    if (import.meta.env.DEV) auditConfig()
    // Web fonts change line lengths — re-measure every ScrollTrigger once they land.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <>
      <a className="skip-link" href="#celebrations">
        Skip to event details
      </a>
      <Navigation />
      <main id="main">
        <IntroSection />
        <InvitationSection />
        <DateSection />
        <StorySection />
        <CelebrationsSection />
        <TravelSection />
        <WishesSection />
        <FinaleSection />
      </main>
      <FxLayer />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

export default App
