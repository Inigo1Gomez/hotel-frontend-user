import { Route, Routes } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { HomePage } from '@/pages/HomePage'
import { SearchPage } from '@/pages/SearchPage'
import { HotelDetailPage } from '@/pages/HotelDetailPage'
import { HelpPage } from '@/pages/HelpPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function App() {
  return (
    <>
      <ScrollProgress />
      <ScrollToTop />
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Navbar />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hoteles" element={<SearchPage />} />
          <Route path="/hotel/:slug" element={<HotelDetailPage />} />
          <Route path="/ayuda" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
